from pymongo import MongoClient
import gridfs

class detdp:
    def __init__(self):
        self.conn_str = "mongodb://mapserverdev:27017"
        self.client = MongoClient(self.conn_str)
        self.db = self.client['detdp']
    def getDB(self):
        return self.db

    def getlogin(self, user_name, user_password):
        user_group = self.db.user.find({'user_name': user_name, 'user_password': user_password}, {'user_group': 1})
        if user_group.count() == 1:
            print 'User Group is :', user_group[0]['user_group']
            print 'here point to retrieve page'
            return user_group[0]['user_group']
        elif user_group.count() == 0 is None:
            print 'No user and password pair exists'
            return None
        else:
            print 'Multiple users with the same user_name and user_password, system error!'
            print 'here point to retrieve page'
            return None
