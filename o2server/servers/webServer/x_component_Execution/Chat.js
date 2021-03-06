MWF.xApplication.Execution.Chat = new Class({
    Extends: MWF.widget.Common,
    Implements: [Options, Events],
    options: {
        "style" : "default",
        "documentId" : ""
    },

    initialize: function (dialogContainer, editorContainer, app, actions, lp, options) {
        this.setOptions(options);
        this.dialogContainer = $(dialogContainer);
        this.editorContainer = $(editorContainer);
        this.app = app;
        this.actions = actions;
        this.lp = lp;
        this.userName = layout.desktop.session.user.name;
        this.userName = layout.desktop.session.user.distinguishedName;
        this.path = "../x_component_Execution/$Chat/"+this.options.style+"/";

        this.actionSettingPath = MWF.defaultPath+"/widget/$SimpleEditor/"+this.options.style+"/ActionSetting.js";

        this.cssPath = this.path + "css.wcss";
        this._loadCss();
        this.orgActionsAlpha = MWF.Actions.get("x_organization_assemble_control");
    },

    load: function () {

        this._loadEmotionSetting();
        if( this.dialogContainer ){
            this.dialogNode = new Element( "div.dialogNode", {
                "styles" : this.css.dialogNode
            }).inject(this.dialogContainer);

            //this.dialogContainer.setStyle("height","400px");

            var _self = this;
            MWF.require("MWF.widget.ScrollBar", function () {
                this.scrollObj = new MWF.widget.ScrollBar(this.dialogContainer, {
                    "indent": false,
                    "style": "default",
                    "where": "before",
                    "distance": 60,
                    "friction": 4,
                    "axis": {"x": false, "y": true},
                    "onScroll": function (y) {
                        //var scrollSize = _self.dialogContainer.getScrollSize();
                        //var clientSize = _self.dialogContainer.getSize();
                        //var scrollHeight = scrollSize.y - clientSize.y;
                        //
                        //if (y + 200 > scrollHeight  && _self.loadDialog) {
                        //    if (! _self.isItemsLoaded) _self.loadDialog();
                        //}
                        if( y == 0 ){
                            if (! _self.isItemsLoaded) _self.loadDialog();
                        }
                    }
                });

                //this.scrollObj.scrollVNode.setStyles({"margin-top":"300px"})
            }.bind(this), false);

            this.items = [];
            this.isItemsLoaded = false;
            this.isItemLoadding = false;
            this.loadDialog( function(){
                this.scrollToLater();
            }.bind(this) );
        }

        if(this.editorContainer){
            this.loadEditor( this.editorContainer, "" );
        }

    },
    scrollToLater : function(){
        setTimeout( function(){
            var clientSize = this.scrollObj.node.getSize();
            if( !this.scrollObj.scrollVNode )this.scrollObj.checkScroll();
            if( this.scrollObj.scrollVNode ){
                var scrollVNodeSize = this.scrollObj.scrollVNode.getSize();
                var maxY = (clientSize.y.toFloat())-(scrollVNodeSize.y.toFloat());
                this.scrollObj.scroll( maxY, null );
            }
        }.bind(this), 500 )
    },
    _loadEmotionSetting : function(){
        if( this.emotionSetting )return;
        var r = new Request({
            url: this.actionSettingPath,
            async: false,
            method: "get",
            onSuccess: function(responseText, responseXML){
                this.emotionSetting = MWF.widget.SimpleEditor.Actions.setting.emotion;
            }.bind(this),
            onFailure: function(xhr){
                alert(xhr.responseText);
            }
        });
        r.send();
    },
    loadDialog: function( callback ){
        if (!this.isItemsLoaded) {
            if (!this.isItemLoadding) {
                this.isItemLoadding = true;


                this.getCurrentPageData(function (json) { //alert(JSON.stringify(json))
                    var length = json.count;  //|| json.data.length;
                    if (length <= this.items.length) {
                        this.isItemsLoaded = true;
                    }


                    json.data.each(function (d) { //alert(JSON.stringify(d))
                        this.loadDialogItem( d );
                    }.bind(this));
                    this.isItemLoadding = false;
                    if( callback )callback();
                }.bind(this), 10 )
            }
        }



        //this.dialogContainer.scrollTo(0, 400 );
        //alert(this.dialogContainer.getScrollSize().y)



    },
    loadDialogItem: function( d , position){
        this.items.push(d.id);
        var isCurrentUser = ( d.senderName == this.userName );
        //var isCurrentUser = false

        var msg_li = new Element("div.msg_li", {"styles": this.css.msg_li}).inject(this.dialogNode, position || "top");

        var msg_item = new Element("div", {"styles": this.css.msg_item}).inject(msg_li);

        var msg_person = new Element("div", {
            "styles": this.css[isCurrentUser ? "msg_person_right" : "msg_person_left"]
        }).inject(msg_item);
        var msg_face = new Element("img", {
            "styles": this.css.msg_face
        }).inject(msg_person);
        this.setUserFace(d.senderName, msg_face);
        if (!isCurrentUser) {
            var msg_name = new Element("div", {
                "styles": this.css.msg_person_name,
                "text": d.senderName.split("@")[0]
            }).inject(msg_person)
        }

        var msg_arrow_left = new Element("div", {
            "styles": this.css[isCurrentUser ? "msg_arrow_right" : "msg_arrow_left"]
        }).inject(msg_item);
        var msg_content_body = new Element("div", {
            "styles": this.css[isCurrentUser ? "msg_content_body_right" : "msg_content_body_left"]
        }).inject(msg_item);

        //if (isCurrentUser) {
        //    var msg_del = new Element("span", {
        //        "styles": this.css.msg_del,
        //        "title": "????????????"
        //    }).inject(msg_content_body);
        //    msg_del.addEvent("click", function () {
        //        if (confirm("???????????????????????????????????????????????????")) {
        //            this.deleteSingleMessage(docid, seq, jQuery(this).parents(".msg_li"));
        //        }
        //    }.bind(this))
        //}

        var msg_content_area = new Element("div", {
            "styles": this.css.msg_content_area
        }).inject(msg_content_body);

        var msg_content_text = new Element("p", {
            "styles": this.css.msg_content_text,
            "html":  this.parseEmotion( d.content )
        }).inject(msg_content_area);

        var msg_content_time = new Element("p", {
            "styles": this.css.msg_content_time,
            "text": d.createTime
        }).inject(msg_content_area);
    },
    parseEmotion : function( content ){
        return content.replace(/\[emotion=(.*?)\]/g, function( a,b ){
            return "<img imagename='"+b+"' style='cursor:pointer;border:0;padding:2px;' " +" class='MWF_editor_emotion' src='"+ this.emotionSetting.imagesPath + b + this.emotionSetting.fileExt +"'>";
        }.bind(this));
    },
    //listMessageData: function( callback ){
    //    var json =  {
    //        "type": "success",
    //        "data": [
    //            {
    //                "id": "53a508ec-7862-4036-a273-c15830cd3f86",
    //                "createTime": "2016-04-19 15:38:50",
    //                "updateTime": "2016-04-19 15:38:50",
    //                "sequence": "2016041915385053a508ec-7862-4036-a273-c15830cd3f46",
    //                "content": "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
    //                "person": "??????"
    //            },
    //            {
    //                "id": "53a508ec-7862-4036-a273-c15830cd3f87",
    //                "createTime": "2016-04-19 15:38:50",
    //                "updateTime": "2016-04-19 15:38:50",
    //                "sequence": "2016041915385053a508ec-7862-4036-a273-c15830cd3f46",
    //                "content": "??????????????????????????????.??????????????????????????????.??????????????????????????????.??????????????????????????????.????????????????????????????????????????????????????????????.",
    //                "person": "??????"
    //            }
    //        ],
    //        "date": "2016-05-27 14:20:07",
    //        "spent": 2,
    //        "size": 2,
    //        "count": 0,
    //        "position": 0,
    //        "message": ""
    //    }
    //
    //},
    getCurrentPageData:function(callback,count){
        if (!count)count = 5;
        var id = (this.items && this.items.length) ? this.items[this.items.length - 1] : "(0)";
        var filter = {"workId":this.options.workId} || {};

        this.actions.getChatListNext(id, count, filter, function (json) { //alert("action="+JSON.stringify(json))
            if (callback) callback(json);
        }.bind(this),null,false)


    },
    setUserFace: function(userName, faceNode ){

        faceNode.set("src",this.orgActionsAlpha.getPersonIcon(userName));
        //this.orgActionsAlpha.getPersonIcon(userName, function(url){
        //    faceNode.set("src",url);
        //    //var json =  { data : { icon : url } };
        //    //this.userCache[ name ] = json;
        //    //if( callback )callback( json );
        //}.bind(this), function(){ alert("err");
        //    //var json =  { data : { icon : "../x_component_ForumDocument/$Main/"+this.options.style+"/icon/noavatar_big.gif" } };
        //    //this.userCache[ name ] = json;
        //    //if( callback )callback( json );
        //}.bind(this));



        //this.getUserData( userName, function( userData ){
        //    var icon;
        //    if( userData.icon ){
        //        icon = "data:image/png;base64,"+userData.icon;
        //    }else{
        //        icon = this.path+ ( userData.genderType=="f" ? "female.png" : "man.png");
        //    }
        //    faceNode.set("src", icon );
        //})
    },
    //getUserData : function( userName, callback ){
    //    this.userData = this.userData || {};
    //    if( this.userData[userName] ){
    //        if(callback)callback(this.userData[userName])
    //    }else{
    //        this.actions.getPerson(function(json){
    //            this.userData[userName] = json.data;
    //            if(callback)callback(json.data)
    //        }.bind(this),null,userName,false)
    //    }
    //},
    sendMessage : function(content, callback){
        var d = {
            "workId" : this.options.workId,
            "createTime": new Date().format("db"),
            "content": content,
            "targetIdentity": this.app.identity,
            "senderName" : this.userName
        };
        this.actions.submitChat(d, function(json){

            }.bind(this),
            function(xhr,text,error){
                var errorText = error;
                if (xhr) errorMessage = xhr.responseText;
                var e = JSON.parse(errorMessage);
                if(e.message){
                    this.app.notice( e.message,"error");
                }else{
                    this.app.notice( errorText,"error");
                }
            }.bind(this),false);

        this.loadDialogItem(d, "bottom");
        if(callback)callback();
    },
    loadEditor: function ( container, data ) {
        MWF.require("MWF.widget.SimpleEditor", function () {
            this.editor = new MWF.widget.SimpleEditor({
                "style": "chatReceive",			//????????????????????????
                "hasHeadNode" : false,
                "hasTitleNode": false,		//??????????????????
                "editorDisabled": false,	//??????????????????????????????
                "hasToolbar": true,		//?????????????????????
                "toolbarDisable": false,	//?????????????????????
                "hasSubmit": true,			//????????????????????????
                "submitDisable": false,	//????????????????????????
                "hasCustomArea": true,		//??????????????????
                "paragraphise": false,		//????????????????????????
                "minHeight": 100,			//????????????
                "maxHeight": 100,			//????????????????????????
                "overFlow": "visible",		//???????????? visible, auto ??? max ,visible ???????????????????????? auto ??????????????????minHeight???????????????max ??????????????????maxHeight????????????(ie6 ??? ?????????????????????????????????)
                "width": "100%",				//??????????????????
                "action": "Emotion",	//??????????????????????????????????????????all??????????????? toolbarItems.json ???????????????????????????????????????????????? action ?????? ????????????????????? "Image | Emotion"
                "limit": 255,				//?????????????????????0???????????????
                "onQueryLoad": function () {
                    return true;
                },
                "onPostLoad": function ( editor ) {
                    editor.setCustomInfo("");
                },
                "onSubmitForm": function ( editor ) {
                    var content = editor.getContent(true);
                    if( content.trim() != "<br>"  && content.trim()!=""){
                        this.sendMessage( content, function(){
                            editor.setContent("");
                            this.scrollToLater();
                        }.bind(this));
                    }else{
                        this.app.notice("?????????????????????","error");
                    }
                }.bind(this)
            }, container, data||"", null, null);
            this.editor.load();
        }.bind(this));
    }

}); 