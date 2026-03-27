import os
import aiosmtplib
from email.message import EmailMessage
import mimetypes

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER", "contact@nautica-swim.ro") 
SMTP_PASS = os.getenv("SMTP_PASS", "parola-ta-aici")

async def send_welcome_email(to_email: str, name: str):
    """Trimite emailul de bun venit la crearea contului."""
    if not to_email:
        return False
        
    message = EmailMessage()
    message["From"] = f"Nautica Swimming Club <{SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = "Bine ai venit în familia Nautica! 🏊‍♂️"

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #000;">Salutare, {name}!</h2>
                <p>Ne bucurăm enorm să te avem alături de noi la <strong>Club Sportiv Nautica</strong>.</p>
                <p>Contul tău a fost creat cu succes. Din portalul tău de client vei putea:</p>
                <ul>
                    <li>Să accesezi codurile QR pentru intrarea la bazin.</li>
                    <li>Să verifici situația abonamentelor pentru toți membrii familiei.</li>
                    <li>Să urmărești numărul de ședințe rămase și valabilitatea.</li>
                </ul>
                <p><strong>Următorul pas:</strong> Accesează site-ul nostru, apasă pe "Intră în cont" și folosește opțiunea "Setează o parolă" folosind această adresă de email.</p>
                <p>Te așteptăm la antrenament!<br><strong>Echipa Nautica</strong></p>
            </div>
        </body>
    </html>
    """
    
    message.set_content(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            use_tls=True
        )
        print(f"[*] Email de bun venit trimis cu succes catre {to_email}")
        return True
    except Exception as e:
        print(f"[!] Eroare la trimiterea emailului de bun venit catre {to_email}: {e}")
        return False
    
async def send_milestone_email(to_email: str, name: str, milestone: int):
    """Trimite email de felicitare la 50 sau 100 de sedinte."""
    if not to_email:
        return False
        
    message = EmailMessage()
    message["From"] = f"Nautica Swimming Club <{SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = f"Felicitări! Ai atins {milestone} de antrenamente! 🎉"

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #6db025; border-radius: 10px;">
                <h2 style="color: #000;">Incredibil, {name}! 🏆</h2>
                <p>Echipa <strong>Nautica</strong> te felicită pentru dedicare!</p>
                <p>Tocmai ai înregistrat prezența cu numărul <strong>{milestone}</strong> la cursurile noastre de înot. Suntem mândri de progresul tău și ne bucurăm să te avem în echipă.</p>
                <p>Sărbătorim împreună la bazin!</p>
                <p>Cu sportivitate,<br><strong>Antrenorii tăi Nautica</strong></p>
            </div>
        </body>
    </html>
    """
    message.set_content(html_content, subtype="html")
    try:
        await aiosmtplib.send(message, hostname=SMTP_HOST, port=SMTP_PORT, username=SMTP_USER, password=SMTP_PASS, use_tls=True)
    except Exception:
        pass

async def send_contact_notification(client_name: str, client_email: str, client_phone: str, message_body: str):
    """Trimite un email catre Admin cand cineva completeaza formularul pe site."""
    message = EmailMessage()
    message["From"] = f"Nautica Website <{SMTP_USER}>"
    message["To"] = SMTP_USER # Trimitem catre noi insine (adresa de admin)
    message["Subject"] = f"Mesaj nou pe site de la: {client_name}"

    html_content = f"""
    <h2>Ai primit un mesaj nou de pe site!</h2>
    <p><strong>Nume:</strong> {client_name}</p>
    <p><strong>Email:</strong> {client_email}</p>
    <p><strong>Telefon:</strong> {client_phone or 'Nespecificat'}</p>
    <hr>
    <p><strong>Mesaj:</strong><br>{message_body}</p>
    """
    message.set_content(html_content, subtype="html")
    try:
        await aiosmtplib.send(message, hostname=SMTP_HOST, port=SMTP_PORT, username=SMTP_USER, password=SMTP_PASS, use_tls=True)
    except Exception:
        pass

async def send_contact_autoresponder(to_email: str, name: str):
    """Trimite un email automat clientului confirmand primirea mesajului."""
    if not to_email:
        return
        
    message = EmailMessage()
    message["From"] = f"Nautica Swimming Club <{SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = "Am primit mesajul tău! 🏊‍♂️"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2>Salutare, {name}!</h2>
        <p>Îți confirmăm că am primit mesajul tău. Echipa Nautica îl va citi și îți va răspunde în cel mai scurt timp posibil.</p>
        <p>Îți mulțumim pentru interesul acordat clubului nostru!</p>
        <p>Cu prietenie,<br><strong>Echipa Nautica</strong></p>
    </div>
    """
    message.set_content(html_content, subtype="html")
    try:
        await aiosmtplib.send(message, hostname=SMTP_HOST, port=SMTP_PORT, username=SMTP_USER, password=SMTP_PASS, use_tls=True)
    except Exception:
        pass

async def send_automated_report(period_name: str, excel_bytes: bytes, is_yearly: bool = False):
    """Trimite pe mail catre Admin excel-ul cu raportul automat (Lunar/Anual)."""
    message = EmailMessage()
    message["From"] = f"Nautica Sistem <{SMTP_USER}>"
    message["To"] = SMTP_USER # Catre adresa de admin
    message["Subject"] = f"Raport {'Anual' if is_yearly else 'Lunar'} Nautica - {period_name} 📊"

    html_content = f"""
    <h2>Raportul tău automat este gata!</h2>
    <p>Găsești atașat fișierul Excel cu toate datele financiare și prezențele pentru perioada: <strong>{period_name}</strong>.</p>
    <p>O zi productivă!<br><em>Sistemul Automat Nautica</em></p>
    """
    message.set_content(html_content, subtype="html")
    
    # Atasam fisierul Excel
    filename = f"Raport_Nautica_{period_name.replace(' ', '_')}.xlsx"
    message.add_attachment(
        excel_bytes, 
        maintype='application', 
        subtype='vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        filename=filename
    )
    
    try:
        await aiosmtplib.send(message, hostname=SMTP_HOST, port=SMTP_PORT, username=SMTP_USER, password=SMTP_PASS, use_tls=True)
        print(f"[*] Raport automat trimis cu succes pt perioada {period_name}.")
    except Exception as e:
        print(f"[!] Eroare la trimiterea raportului: {e}")