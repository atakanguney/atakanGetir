var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var recordCollection;

function connectToDatabase(databaseUrl){
    return new Promise(function(resolve,reject){
        mongoose.connect(databaseUrl,function(err,database){
          if(err){reject(err)};
          resolve(database.collection('records'));
        });
    });
  };
  connectToDatabase("mongodb://dbUser:dbPassword@ds155428.mlab.com:55428/getir-bitaksi-hackathon")
    .then(function(records){    
        recordCollection = records;
    })
    .catch(function(err){
      console.log(err);
    });

/* GET records. */
router.post('/', function(req, res) {
  
      var result =recordCollection.aggregate(
        [{$unwind:"$counts"},
        {$group:{
            _id :"$_id",
            key : { $first: '$key' },
            createdAt : {$first : '$createdAt'},
            totalCount : {$sum:"$counts"}

        }},
        {'$match':
            {
                'totalCount': {'$gte': req.body.minCount,'$lte':req.body.maxCount},
                'createdAt':{'$gte':new Date(req.body.startDate),'$lte':new Date(req.body.endDate)} 
            }
        },
        {'$project':
            {'_id':0}
        }

        ]
      ).toArray(function(err,result){
          if(err) res.send(err);
          res.send(result);
      });
  
});

module.exports = router;
