from flask import Flask, redirect, url_for, session, render_template
from werkzeug.security import generate_password_hash
from forms.forms import SignupForm
from models.user import db, User
from app import app  
from authlib.integrations.flask_client import OAuth

oauth = OAuth(app)

google = oauth.register(
    name='google',
    client_id='223427186122-tgac713fnu9dpoq2ump17dm05qcfkrbk.apps.googleusercontent.com',
    client_secret='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',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)


@app.route('/signup', methods='POST')
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, email=form.email.data, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('signup.html', form=form)

@app.route('/login/google')
def login_with_google():
    redirect_uri = url_for('authorize_google', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize/google')
def authorize_google():
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    return 'Logged in using Google.'
