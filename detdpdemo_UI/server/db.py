from pymongo import MongoClient
import gridfs
from bson.code import Code
import operator

class detdp:
    def __init__(self):
        self.conn_str = "mongodb://mapserverdev:27017"
        self.client = MongoClient(self.conn_str)
        self.db = self.client['detdp']
    def get_DB(self):
        return self.db

    def get_login(self, user_name, user_password):
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

    def get_record_mode(self):
        result = self.db.data_conf.find({}).distinct('record_mode')
        return result

    def get_program(self):
        tmp = self.db.data_conf.find({}, {'_id': False})
        result = [t for t in tmp]
        return result
    def get_upload_overview(self):
        mapper = Code("""
                        function(){
                            var combo_key = { 'doe_name':this.doe_name, 'program':this.program,
                            'record_mode':this.record_mode, 'read_only': this.read_only};
                            emit(combo_key,1);
                        }
                    """)

        reducer = Code("""
                        function (key, values){
                            var total = 0;
                            for (var i = 0; i < values.length; i++){
                                total += values[i];
                            }
                            return total;
                        }
                    """)
        conf_info = self.db.conf_file.map_reduce(mapper, reducer, "myresult")
        conf_list = []
        for row in conf_info.find():
            conf_list.append(row.get('_id'))

        data_info = self.db.data_file.find({}, projection={'doe_name': True, 'doe_descr': True, 'Comment': True,
                                                           'upload_date': True, 'upload_user': True, 'file_size': True,
                                                           '_id': False})
        data_list = []
        for row in data_info:
            if row.get('upload_date') is not None:
                row['upload_date'] = str(row['upload_date'])
            data_list.append(row)

        sorting_key = operator.itemgetter("doe_name")
        for i, j in zip(sorted(conf_list, key=sorting_key), sorted(data_list, key=sorting_key)):
            i.update(j)
        return conf_list
