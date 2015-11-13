from flask import Flask, jsonify, request
import os

app = Flask(__name__)
from flask.ext.cors import CORS, cross_origin

CORS(app)


@app.route("/list")
@cross_origin()
def list_file():
  dir_data = os.listdir('.')
  return jsonify({'dir': dir_data, 'dir2': dir_data})


@app.route("/hello")
def hello():
  return 'hello'


@app.route('/login', methods=['GET', 'POST'])
def login():
  data = request.data
  print data
  return jsonify({'status':'success'})

if __name__ == "__main__":
  app.run(use_debugger=True, debug=True)
