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
    var_user_group = db.getlogin(var_username,var_password)
    if  var_user_group is None:
        status = "User login failed, Please try again."
        # return render_template('index.html', error = statues)
    else:
        session['logged_in'] = True
        flash('You were just logged in!')
        status = "User login succeed,"
        if var_user_group == 'R':
            status = status + 'point to retrieve page'
            # return render_template('views/retrieve.html', error = status)
        else:
            status = status + 'point to upload page'
            # return render_template('views/upload.html', error = status)
    return jsonify ({'status': status})

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))


if __name__ == "__main__":

    app.run(debug=True)
