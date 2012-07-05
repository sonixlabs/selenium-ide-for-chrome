var db ={
  set : function(key, obj){
    localStorage.setItem(key, JSON.stringify(obj));
  },

  get : function(key){
    return JSON.parse(localStorage.getItem(key));
  },

  each : function(fun){
    try{
      for (var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        fun(k,db.get(k));
      }
    }catch(e){
      for (var key in localStorage){
        if(key === 'key') continue;
        fun(key,db.get(key));
      }
    }
  }
};

