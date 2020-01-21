/**
 * Wood Plugin Module.
 * sql数据模型
 * by jlego on 2018-11-25
 */
const Model = require('./src/modelsql');

module.exports = (app = {}, config = {}) => {
  const { Mysql } = require('wood-mysql')(app);
  app._models = new Map();
  app.Model = function(_tableName, fields, select = {}, primarykey) {
    let nameArr = _tableName.split('.'),
      dbName = nameArr.length > 1 ? nameArr[0] : 'master',
      tableName = nameArr.length > 1 ? nameArr[1] : nameArr[0];
    if(_tableName){
      if(app._models.has(tableName)){
        let _model = app._models.get(tableName);
        if(_model) _model.resetData();
        return _model;
      }
      if (tableName && fields) {
        let theModel = new Model({
          tableName,
          fields,
          primarykey
        });
        theModel.db = new Mysql(tableName, dbName, fields);
        app._models.set(tableName, theModel);
        theModel._init();
        return app._models.get(tableName);
      }
    }
    return Model;
  };
  if(app.addAppProp) app.addAppProp('Modelsql', app.Model);
  return app;
}
