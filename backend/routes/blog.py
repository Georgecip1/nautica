from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from core.auth import require_admin
from core.db import db
from models.content import BlogPost, BlogPostCreate

router = APIRouter(tags=['blog'])


@router.get('/blog')
async def get_blog_posts(published_only: bool = True):
    query = {'is_published': True} if published_only else {}
    posts = await db.blog.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    return posts


@router.get('/blog/{slug}')
async def get_blog_post(slug: str):
    post = await db.blog.find_one({'slug': slug}, {'_id': 0})
    if not post:
        raise HTTPException(status_code=404, detail='Articol negăsit')
    return post


@router.post('/blog')
async def create_blog_post(post_data: BlogPostCreate, admin: dict = Depends(require_admin)):
    existing = await db.blog.find_one({'slug': post_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail='Slug-ul este deja utilizat')

    post = BlogPost(**post_data.model_dump())
    await db.blog.insert_one(post.model_dump())
    return post.model_dump()


@router.put('/blog/{post_id}')
async def update_blog_post(post_id: str, post_data: BlogPostCreate, admin: dict = Depends(require_admin)):
    existing = await db.blog.find_one({'id': post_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Articol negăsit')

    slug_check = await db.blog.find_one({'slug': post_data.slug, 'id': {'$ne': post_id}})
    if slug_check:
        raise HTTPException(status_code=400, detail='Slug-ul este deja utilizat')

    update_data = post_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

    await db.blog.update_one({'id': post_id}, {'$set': update_data})
    updated = await db.blog.find_one({'id': post_id}, {'_id': 0})
    return updated


@router.delete('/blog/{post_id}')
async def delete_blog_post(post_id: str, admin: dict = Depends(require_admin)):
    await db.blog.delete_one({'id': post_id})
    return {'message': 'Articol șters'}