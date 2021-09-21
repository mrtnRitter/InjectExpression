{
    function script(thisObj){
        function buildUI(thisObj){

            // --------------------------------------------------------------------------------------------
            // ---------------------------------------- METAINFOS -------------------------------
            // --------------------------------------------------------------------------------------------
           
            appname = "InjectExpression";
            version = "1.0";
            date =  "August 2017";
            desription = "Reads out and pasts an Expression into selected layer properties. Before pasting, Expressions can be created or edited."
            copyright = "Martin Ritter @ Vogel & Moritz GbR";
            
			
            // --------------------------------------------------------------------------------------------
            // ---------------------------------------- INTERFACE --------------------------------
            // --------------------------------------------------------------------------------------------

            // panel or window?
            var IEPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", appname, undefined, {resizeable:true});


            // ----------------------- Container -----------------------
            IEPanel.alignChildren = ['fill', 'fill'];
            IEPanel.minimumSize = [200,100];
            IEPanel.add('group');
            IEPanel.orientation = 'stack';
              
            // -------------------------- Main -------------------------
            mainres =   "group{orientation:'column', alignment:['fill', 'fill'], alignChildren:['fill','fill'], minimumSize:[200,100],\
                                gr_et: Group{orientation: 'stack', alignment:['fill', 'fill'], alignChildren:['fill','fill'],\
                                st: StaticText{properties:{multiline: true}, alignment:['fill','fill']},\
                                et: EditText{properties:{multiline: true}}\
                            },\
                                gr_btn: Group{orientation:'row',alignment:['fill', 'bottom'], alignChildren:['fill','fill'],\
                                btn_ro: Button{text:'Read out', maximumSize:[10000,20]},\
                                btn_ie: Button{text:'Inject!', maximumSize:[10000,20]},\
                                btn_about: Button{text:'?', alignment:['right', 'fill'], maximumSize:[15,20]}\
                            }\
                        }";
            
            IEMainPanel = IEPanel.add(mainres);


            // ------------------- Init UI: Colors and Presets ---------------------
            var btn_ro_bg = [20,61,102,100];
            var btn_ie_bg = [102,0,19,100];
            var btn_txt = [185,185,185,255];
            var dim = 100;
            
            colorObj(IEMainPanel.gr_btn.btn_ro, btn_ro_bg, btn_txt);
            colorObj(IEMainPanel.gr_btn.btn_ie, btn_ie_bg, btn_txt);

            IEMainPanel.gr_et.st.text = st_initText;
            IEMainPanel.gr_et.et.hide();
            
            
            // ------------------- Texts ---------------------
            st_initText = "Select a property with an expression and click on Read out or move mouse to this text to enter an new expression";
            
            
            // -------------------------- Resizing ----------------------
            IEPanel.layout.layout(true);
            IEPanel.layout.resize();
            IEPanel.onResizing = IEPanel.onResize = function(){
                this.layout.resize();			
            };	

            
            // --------------------------------------------------------------------------------------------
            // ----------------------------------------- EVENTS ------------------------------------
            // --------------------------------------------------------------------------------------------
            IEMainPanel.gr_btn.btn_ro.addEventListener("mouseover", btn_ro_mo);
            IEMainPanel.gr_btn.btn_ie.addEventListener("mouseover", btn_ie_mo);
            
            IEMainPanel.gr_btn.btn_ro.addEventListener("mouseout", btn_ro_mout);
            IEMainPanel.gr_btn.btn_ie.addEventListener("mouseout", btn_ie_mout);
            
            IEMainPanel.gr_et.addEventListener("mouseover", activeEditMode);
            IEMainPanel.gr_et.et.addEventListener("mouseout", deactiveEditMode);
            
            
            // --------------------------------------------------------------------------------------------
            // ----------------------------------------- BUTTONS ----------------------------------
            // --------------------------------------------------------------------------------------------
            
            // -------------------------- Read Out ----------------------
            IEMainPanel.gr_btn.btn_ro.onClick = function(){
                readout();   
            }
            
            // -------------------------- Inject ----------------------
            IEMainPanel.gr_btn.btn_ie.onClick = function(){
                app.beginUndoGroup('InjectExpression');
                inject();
                app.endUndoGroup();
            }


            // --------------------------------------------------------------------------------------------
            // ---------------------------------------- FUNCTIONS --------------------------------
            // --------------------------------------------------------------------------------------------
            
            // -------------------------- Color Buttons ----------------------
            
            function colorObj(myobj,bgcolor,txtcolor){
               
                bgcolor = rgba_to_aecmodel(bgcolor);
                txtcolor = rgba_to_aecmodel(txtcolor);
               
                myobj.pen = myobj.graphics.newPen(myobj.graphics.PenType.SOLID_COLOR, txtcolor, 1);
                myobj.brush = myobj.graphics.newBrush(myobj.graphics.BrushType.SOLID_COLOR, bgcolor);

                myobj.onDraw = function(){
                    with(this){
                        graphics.drawOSControl();
                        graphics.rectPath(0,0,size[0], size[1]);
                        graphics.fillPath(brush);
                        
                        // center text
                        stringsize = graphics.measureString(text,graphics.font, size[0]);
                        x = (size[0]-stringsize[0])/2;
                        y = (size[1]-stringsize[1])/2;
                        
                        graphics.drawString(text,myobj.pen,x,y,graphics.font);
                        
                    }
                }                
            }
			
			
            // -------------------------- Convert 0-255 to 0-1 ----------------------
            function rgba_to_aecmodel(rgba){
                ae_r = rgba[0]/255;
                ae_g = rgba[1]/255;
                ae_b = rgba[2]/255;
                ae_a = rgba[3]/255;
                
                return [ae_r, ae_g, ae_b, ae_a];
            }

    
            // --------------------- Button Mouseover and Mouseout -------------------
            function btn_ro_mo(){
                btn_ro_bg[3]=255;
                colorObj(IEMainPanel.gr_btn.btn_ro, btn_ro_bg, btn_txt);
            }    

            
            function btn_ro_mout(){
                btn_ro_bg[3]=dim;
                colorObj(IEMainPanel.gr_btn.btn_ro, btn_ro_bg, btn_txt);
            }
            
                        
            function btn_ie_mo(){
                btn_ie_bg[3]=255;
                colorObj(IEMainPanel.gr_btn.btn_ie, btn_ie_bg, btn_txt);
            }

            
            function btn_ie_mout(){
                btn_ie_bg[3]=dim;
                colorObj(IEMainPanel.gr_btn.btn_ie, btn_ie_bg, btn_txt);
            } 
           
            
            // -------------------------- Activate EditMode ------------------------
            
            function activeEditMode(){
                IEMainPanel.gr_et.et.show();
            }


            // -------------------------- Deactivate EditMode ----------------------
            
            function deactiveEditMode(){
                
                if (IEMainPanel.gr_et.et.text != 0){
                    IEMainPanel.gr_et.st.text = IEMainPanel.gr_et.et.text;
                } else {
                    IEMainPanel.gr_et.st.text = st_initText;
                }
                
                IEMainPanel.gr_et.et.hide();
            }

            
            // -------------------------- Readout Expression ----------------------
            function readout(){
                ro_expr = app.project.activeItem.selectedLayers[0].selectedProperties[0].expression;
                IEMainPanel.gr_et.st.text = IEMainPanel.gr_et.et.text = ro_expr;
            }

           
            // -------------------------- Inject Expression ----------------------
            function inject(){
                in_expr = IEMainPanel.gr_et.et.text;
                selection = app.project.activeItem.selectedProperties;

                for(i = 0; i<= selection.length; i++){
                    selection[i].expression = in_expr;  
                }
            }

            // <-- END OF FUNCTIONS
            
			return IEPanel;
        }

        var myScriptPal = buildUI(thisObj);

        if ((myScriptPal != null) && (myScriptPal instanceof Window)){
            myScriptPal.center();
            myScriptPal.show();
        }
    }
    script(this);
}