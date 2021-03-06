MWF.xDesktop.requireApp("Attendance", "Explorer", null, false);
MWF.xDesktop.requireApp("Template", "MPopupForm", null, false);
MWF.xDesktop.requireApp("Template", "MDomItem", null, false);
MWF.xDesktop.requireApp("Selector", "package", null, false);
MWF.xApplication.Attendance.ImportExplorer = new Class({
    Extends: MWF.xApplication.Attendance.Explorer,
    Implements: [Options, Events],

    initialize: function(node, app, actions, options){
        this.setOptions(options);
        this.app = app;
        this.path = "../x_component_Attendance/$ImportExplorer/";
        this.cssPath = "../x_component_Attendance/$ImportExplorer/"+this.options.style+"/css.wcss";
        this._loadCss();

        this.actions = actions;
        this.node = $(node);

        this.initData();
        if (!this.personActions) this.personActions = new MWF.xAction.org.express.RestActions();
    },
    loadView : function(){
        this.view = new MWF.xApplication.Attendance.ImportExplorer.View(this.elementContentNode, this.app,this, this.viewData, this.options.searchKey );
        this.view.load();
        this.setContentSize();
    },
    createDocument: function(){
        if(this.view)this.view._createDocument();
    },
    importExcel : function(){
        //this.importer = new MWF.xApplication.Attendance.ImportExplorer.Importer( this );
        //this.importer.upload();
        this.upload();
    },
    upload : function(){
        if (!this.uploadFileAreaNode){
            this.uploadFileAreaNode = new Element("div");
            var html = "<input name=\"file\" type=\"file\"/>";
            this.uploadFileAreaNode.set("html", html);

            this.fileUploadNode = this.uploadFileAreaNode.getFirst();
            this.fileUploadNode.addEvent("change", function(){

                var files = fileNode.files;
                if (files.length){
                    for (var i = 0; i < files.length; i++) {
                        var file = files.item(i);
                        var tmp = file.name.split(".");
                        this.uploadFileName = file.name;
                        if( tmp[tmp.length-1].toLowerCase() != "xls" && tmp[tmp.length-1].toLowerCase() != "xlsx" ){
                            this.app.notice("?????????excel?????????","error");
                            return;
                        }
                        var formData = new FormData();
                        formData.append('file', file);
                        this.actions.uploadAttachment( function( json ){
                            var id = json.id;
                            this.actions.getAttachmentInfo( id, function( info ){
                                var progress = new MWF.xApplication.Attendance.ImportExplorer.Progress(id, this.actions);
                                progress.load( function(){
                                    var form = new MWF.xApplication.Attendance.ImportExplorer.Result(this, info.data, { id : id }, { app : this.app , actions : this.app.restActions, css : {} });
                                    form.open();
                                    this.view.reload();
                                }.bind(this))
                            }.bind(this));
                        }.bind(this), function(xhr, text, error){
                            var errorText = error;
                            if (xhr) errorText = xhr.responseText;
                            this.app.notice( errorText,"error");
                        }.bind(this), formData, file);
                    }
                }
            }.bind(this));
        }
        var fileNode = this.uploadFileAreaNode.getFirst();
        fileNode.click();
    },
    checkData : function(){
        var selector = new MWF.xApplication.Attendance.ImportExplorer.YearMonthSelctor(this);
        selector.edit();
    },
    analyseData : function(){
        this.actions.analyseDetail("0","0",function(){
            this.app.notice("????????????????????????","success")
        }.bind(this))
    },
    staticData : function(){
        this.actions.staticAllDetail(function(){
            this.app.notice("????????????????????????","success")
        }.bind(this))
    },
    downloadTemplate : function(){
        window.open( o2.filterUrl(this.path + encodeURIComponent( "dataTemplate.xls" ), "_blank" ))
    },
    showDescription: function( el ){
        if( this.descriptionNode ){
            this.descriptionNode.setStyle("display","block");
            this.descriptionNode.position({
                relativeTo: el,
                position: 'bottomLeft',
                edge: 'upperCenter',
                offset:{
                    x : -60,
                    y : 0
                }
            });
        }else{
            this.descriptionNode = new Element("div", {"styles": this.css.descriptionNode}).inject(this.node);
            this.descriptionNode.position({
                relativeTo: el,
                position: 'bottomLeft',
                edge: 'upperCenter',
                offset:{
                    x : -60,
                    y : 0
                }
            });
            this.descriptionNode.addEvent("mousedown", function(e){e.stopPropagation();});
            document.body.addEvent("mousedown", function(){ this.descriptionNode.setStyle("display","none")}.bind(this));
            var table = new Element("table", {
                "width" : "100%", "border" : "0", "cellpadding" : "5", "cellspacing" : "0",  "styles" : this.css.filterTable, "class" : "filterTable"
            }).inject( this.descriptionNode );
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" : "??????????????????" , "styles" : this.css.descriptionTdHead }).inject(tr);
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" :"1?????????Excel????????????????????????????????????????????????" , "styles" : this.css.descriptionTdValue  }).inject(tr);
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" : "2???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"  , "styles" : this.css.descriptionTdValue }).inject(tr);
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" : "3???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"  , "styles" : this.css.descriptionTdValue }).inject(tr);
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" : "4????????????????????????????????????????????????????????????????????????"  , "styles" : this.css.descriptionTdValue }).inject(tr);
            var tr = new Element("tr").inject(table);
            new Element("td",{ "text" : "5????????????????????????????????????????????????????????????????????????????????????????????????"  , "styles" : this.css.descriptionTdValue }).inject(tr);
        }
    }
});

MWF.xApplication.Attendance.ImportExplorer.View = new Class({
    Extends: MWF.xApplication.Attendance.Explorer.View,
    _createItem: function(data){
        return new MWF.xApplication.Attendance.ImportExplorer.Document(this.table, data, this.explorer, this);
    },

    _getCurrentPageData: function(callback, count){
        this.actions.listAttachmentInfo(function(json){
            if (callback) callback(json);
        });
    },
    _removeDocument: function(document, all){
        this.actions.deleteAttachment(document.id, function(json){
            this.explorer.view.reload();
            this.app.notice(this.app.lp.deleteDocumentOK, "success");
        }.bind(this));
    },
    _createDocument: function(){
        //var permission = new MWF.xApplication.Attendance.ImportExplorer.Importer(this.explorer);
        //permission.create();
    },
    _openDocument: function( documentData ){
        this.actions.getAttachmentStream( documentData.id )
    }

});

MWF.xApplication.Attendance.ImportExplorer.Document = new Class({
    Extends: MWF.xApplication.Attendance.Explorer.Document,
    openVaild : function( e ){
        //this.importer = new MWF.xApplication.Attendance.ImportExplorer.Importer( this );
    },
    openResult: function(){
        var form = new MWF.xApplication.Attendance.ImportExplorer.Result(this, this.data, { id : this.data.id }, { app : this.app , actions : this.app.restActions, css : {} });
        form.open();
    }
});

MWF.xApplication.Attendance.ImportExplorer.YearMonthSelctor = new Class({
    Extends: MPopupForm,
    options : {
        "style" : "attendance",
        "width": 500,
        "height": 300,
        "hasTop" : true,
        "hasBottom" : true,
        "title" : "??????????????????",
        "draggable" : true,
        "closeAction" : true,
        "false" : true
    },
    _createTableContent: function(){
        this.formTableContainer.setStyles({
            "width" : "300px"
        });

        var html = "<table width='100%' bordr='0' cellpadding='5' cellspacing='0' styles='formTable'>"+
            //"<tr><td colspan='2' styles='formTableHead'>??????????????????</td></tr>" +
            "<tr><td styles='formTabelTitle' lable='cycleYear'></td>"+
            "    <td styles='formTableValue' item='cycleYear'></td></tr>" +
            "<tr><td styles='formTabelTitle' lable='cycleMonth'></td>"+
            "    <td styles='formTableValue' item='cycleMonth'></td></tr>" +
            "</table>";
        this.formTableArea.set("html",html);
        MWF.xDesktop.requireApp("Template", "MForm", function(){
            this.form = new MForm( this.formTableArea, {}, {
                isEdited : this.isEdited || this.isNew,
                itemTemplate : {
                    cycleYear : {
                        text:"??????",
                        type : "select",
                        selectValue : function(){
                            var years = []; d = new Date();
                            for(var i=0 ; i<5; i++){
                                years.push(d.getFullYear());
                                d.setFullYear(d.getFullYear()-1)
                            }
                            return years;
                        }
                    },
                    cycleMonth : {
                        text:"??????",
                        type : "select",
                        defaultValue : function(){ return new Date().getMonth(); },
                        selectValue : ["1","2","3","4","5","6","7","8","9","10","11","12"]
                    }
                }
            }, this.app);
            this.form.load();
        }.bind(this), true);
    },
    _ok: function( data, callback ){
        this.app.restActions.checkDetail( data.cycleYear, data.cycleMonth, function(json){
            this.app.notice("????????????????????????");
            this.close();
        }.bind(this));
    }
});

MWF.xApplication.Attendance.ImportExplorer.Result = new Class({
    Extends: MPopupForm,
    options : {
        "style" : "attendance",
        "width": 800,
        "height": 600,
        "hasTop" : true,
        "hasBottom" : false,
        "title" : "????????????????????????",
        "draggable" : true,
        "closeAction" : true,
        "hasScroll" : true,
        "closeByClickMask" : true,
        "id" : ""
    },
    _createTableContent: function(){

        this.actions.getImportStatusDetail( this.options.id, function( json ){
            this.checkData = json.data;
            this.createImportContent();
        }.bind(this));
    },
    createImportContent : function(){
        if( this.checkData.errorCount == 0 ){
            var text ="??????????????????:???" +  this.data.fileName + "?????????????????????????????????????????????"+this.checkData.detailList.length+"??????" ;
        } else{
            var text ="??????????????????:???" +  this.data.fileName + "????????????????????????"+ this.checkData.errorCount +"??????????????????????????????????????????????????????????????????"+this.checkData.detailList.length+"??????" ;
        }
        this.formDescriptionNode = new Element("div", {
            "styles": this.css.formDescriptionNode,
            "text" : text
        }).inject(this.formTableArea);

        var table = new Element("table", {
            "width" : "100%", "border" : "", "cellpadding" : "5", "cellspacing" : "0",  "styles" : this.css.editTable, "class" : "editTable"
        }).inject( this.formTableArea );

        var tr = new Element("tr").inject(table);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "??????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "?????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "??????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "????????????"  }).inject(tr);
        var td = new Element("td", {  "styles" : this.css.editTableTitle, "text" : "??????"  }).inject(tr);
        td.setStyle( "width" , "300px" );

        this.checkData.detailList.each(function( d ){
            var tr = new Element("tr").inject(table);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.curRow }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.employeeNo }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.employeeName.split('@')[0] }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.recordDateString }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.onDutyTime }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.morningOffDutyTime }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.afternoonOnDutyTime }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.offDutyTime }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.checkStatus == "error" ? "??????" : "??????" }).inject(tr);
            var td = new Element("td", { "styles" : this.css.editTableValue , "text": d.description }).inject(tr);
        }.bind(this))
    }
});


MWF.xApplication.Attendance.ImportExplorer.Progress = new Class({
    initialize : function( id, actions ){
        this.id = id;
        this.actions = actions;
    },
    load : function( callback ){
        this.currentDate = new Date();
        this.addFormDataMessage();
        this.status = "ready";
        this.intervalId = setInterval( function(){
            this.actions.getImportStatus( this.id, function( json ){
                var data = json.data;
                if( data.processing && data.currentProcessName != "COMPLETE"){
                    if( data.currentProcessName == "VALIDATE" ){
                        if( this.status != data.currentProcessName ){
                            this.setMessageTitle( "??????????????????" );
                            this.setMessageText( "????????????????????????"+data.process_validate_total+"???" );
                            this.status = data.currentProcessName;
                        }
                        this.updateProgress( data.currentProcessName, data.process_validate_count, data.process_validate_total, data.errorCount );
                    }else if( data.currentProcessName == "SAVEDATA" ){
                        if( this.status != data.currentProcessName ){
                            this.setMessageTitle( "??????????????????" );
                            this.setMessageText( "????????????????????????"+data.process_save_total+"???" );
                            this.status = data.currentProcessName;
                        }
                        this.updateProgress( data.currentProcessName, data.process_save_count, data.process_save_total, data.errorCount );
                    }
                }else{
                    this.status = data.currentProcessName;
                    clearInterval( this.intervalId );
                    this.transferComplete( data );
                    if( callback )callback();
                }
            }.bind(this), null)
        }.bind(this), 500 );
    },
    addFormDataMessage: function( noProgress ){
        var contentHTML = "";
        if (noProgress){
            contentHTML = "<div style=\"height: 20px; line-height: 20px\">"+"????????????????????????..."+"</div></div>" ;
        }else{
            contentHTML = "<div style=\"overflow: hidden\"><div style=\"height: 3px; border:1px solid #999; margin: 3px 0px\">" +
                "<div style=\"height: 3px; background-color: #acdab9; width: 0px;\"></div></div>" +
                "<div style=\"height: 20px; line-height: 20px\">"+"????????????????????????..."+"</div></div>" ;
        }
        var msg = {
            "subject": "??????????????????",
            "content": contentHTML
        };
        this.messageItem = layout.desktop.message.addMessage(msg);
        this.messageItem.status = "ready";

        window.setTimeout(function(){
            if (!layout.desktop.message.isShow) layout.desktop.message.show();
        }.bind(this), 100);
    },
    updateProgress: function(type, loaded, total, errorCount){
        var messageItem = this.messageItem;
        var processed = errorCount ? ( loaded + errorCount ) : loaded;
        var percent = 100*(processed/total);

        var sendDate = new Date();
        var lastDate = this.lastTime || this.currentDate;
        var ms = sendDate.getTime() - lastDate.getTime();
        var speed = ( (processed - ( this.lastProcessed || 0 )) * 1000)/ms ;
        var u = "???/???";
        speed = speed.round(2);

        if (messageItem.contentNode){
            var progressNode = messageItem.contentNode.getFirst("div").getFirst("div");
            var progressPercentNode = progressNode.getFirst("div");
            var progressInforNode = messageItem.contentNode.getFirst("div").getLast("div");
            progressPercentNode.setStyle("width", ""+percent+"%");
            if( type == "VALIDATE" ){
                var text = "???????????????"+": "+speed+u + ",???"+total+"???,??????"+( total - loaded )+"???";
                text += errorCount ? ",??????"+errorCount+"???" : ""
            }else{
                var text = "???????????????"+": "+speed+u + ",???"+total+"???,??????"+( total - loaded )+"???";
                text += errorCount ? ",??????"+errorCount+"???" : ""
            }
            progressInforNode.set("text", text);
        }
        this.lastProcessed = processed;
        this.lastTime = new Date();
    },
    transferComplete: function( data ){
        var errorCount = data.errorCount;
        var messageItem = this.messageItem;

        var sendDate = new Date();
        var ms = sendDate.getTime()-this.currentDate.getTime();

        var timeStr = "";
        if (ms>3600000){
            var h = ms/3600000;
            var m_s = ms % 3600000;
            var m = m_s / 60000;
            var s_s = m_s % 60000;
            var s = s_s/1000;
            timeStr = ""+h.toInt()+"??????"+m.toInt()+"???"+s.toInt()+"???";
        }else if (ms>60000){
            var m = ms / 60000;
            var s_s = ms % 60000;
            var s = s_s/1000;
            timeStr = ""+m.toInt()+"???"+s.toInt()+"???";
        }else{
            var s = ms/1000;
            timeStr = ""+s.toInt()+"???";
        }

        if( errorCount == 0 ){
            var size = data.process_save_total;
            var speed = (size * 1000)/ms ;
            var u = "???/???";
            speed = speed.round(2);

            this.setMessageTitle( "????????????");
            this.setMessageText( "???????????????"+size+"???  ??????"+": "+speed+u+"  "+"??????"+": "+timeStr);
        }else{
            var size = data.process_validate_total;
            this.setMessageTitle( "????????????");
            this.setMessageText( "????????????"+size+"???  ??????"+ errorCount +"???  ??????"+": "+timeStr +"  ????????????????????????");
        }
        this.clearMessageProgress();
    },
    setMessageText: function( text){
        var progressPercentNode = this.getProgessNode().getFirst("div");
        this.getProgressInforNode().set("text", text);
        this.messageItem.dateNode.set("text", (new Date()).format("db"));
    },
    setMessageTitle: function( text){
        this.messageItem.subjectNode.set("text", text);
    },
    clearMessageProgress: function(){
        var progressNode = this.getProgessNode();
        progressNode.destroy();
    },
    getProgessNode : function(){
        if(!this.progressNode)this.progressNode = this.messageItem.contentNode.getFirst("div").getFirst("div");
        return this.progressNode;
    },
    getProgressInforNode : function(){
        if(!this.progressInforNode)this.progressInforNode = this.messageItem.contentNode.getFirst("div").getLast("div");
        return this.progressInforNode;
    }
});




