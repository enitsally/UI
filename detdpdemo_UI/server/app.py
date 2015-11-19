from flask import Flask, jsonify, request, session, render_template, redirect, flash
import json

app = Flask(__name__)
app.secret_key = 'detdpdemo key'

from flask.ext.cors import CORS, cross_origin
from db import detdp
CORS(app)

@app.route("/list")
@cross_origin()
def list_file():
    dir_data = 'test'
    return jsonify({'dir': dir_data, 'dir2': dir_data})


@app.route("/hello")
def hello():
    return 'hello'


@app.route('/login', methods=['GET','POST'])
def login():
    input_data = json.loads(request.data)

    var_username = input_data['username']
    var_password = input_data['password']
    db = detdp()
    var_user_group = db.get_login(var_username,var_password)
    if var_user_group is None:
        status = None
    else:
        session['logged_in'] = True
        status = var_user_group

    print status
    return jsonify ({'status': status})

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    status = "You are log out."
    return jsonify ({'status': status})

@app.route('/get$record$mode')
def get_record_mode():
    db = detdp()
    status = db.get_record_mode()
    return jsonify ({'status': status})

@app.route('/get$program')
def get_program():
    db = detdp()
    status = db.get_program()
    return jsonify ({'status': status})

@app.route('/get$upload$overview')
def get_upload_overview():
    db=detdp()
    status = db.get_upload_overview()
    return jsonify ({'status': status})
    
if __name__ == "__main__":

    app.run(debug=True)
