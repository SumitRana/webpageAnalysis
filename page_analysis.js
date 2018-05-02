// Author: Sumit Rana : Sam
// Identification attributes - data-plugin="etrack", data-track="view",data-elementid

var analyzed_list = []
var total_scroll_counts = 0;
var element_ids;
var total_visible_time = 0;
var element_refs=[];
var element_objects = [];

var start_time = null;

var ViewAnalyze = (function(){
	var instance = null;
	var AnalysisManager = function(){

		var element_config = function(elm){
			this.visible_counts = 0;
			this.visible_time = 0;
			this.counter = 0;
			this.timer;
			this.element = elm;
			this.is_inside_viewport = function(){
				
				dim = this.element.getBoundingClientRect();
				var t;
				//vertical checking
				if(this.counter==0)
				{	console.log('test:::'+this.counter+","+this.visible_time);
					this.timer = setInterval(function(){
						this.visible_time++;	
					},1000);
					this.counter=1;
				}
		
				if(dim.top >= 0 && dim.bottom<=window.innerHeight)
				{
					//element completely in view port - no part outside viewport
					this.visible_counts++;
				}
				else if(dim.top<0 && dim.bottom>0 && dim.bottom > window.innerHeight)
				{
					//element still covering the complete view port
					this.visible_counts++;
				}
				else if(dim.top<0 && dim.bottom>0 && dim.bottom <= window.innerHeight)
				{
					//element part on viewport - rest above
					var in_factor = dim.bottom/window.innerHeight;
					if(in_factor>0.5)
					{	this.visible_counts++;
							}
				}
				else if(dim.top>0 && dim.bottom>window.innerHeight)
				{
					//element part on viewport - rest below
					var in_factor = (window.innerHeight-dim.top)/window.innerHeight;
					if(in_factor>0.4)
					{	this.visible_counts++;
						}
				}
				else{
					console.log('clearing timeout.');
					clearTimeout(this.timer);
					this.counter=0;
				}
		
				total_scroll_counts++;
			};
		};

		this.bindViewAnalyzer = function(){
			var elements = document.querySelectorAll('[data-plugin="etrack"][data-track="view"]');
			var i=0;
			for(i=0;i<elements.length;i++){
				element_objects[i] = new element_config(elements[i]);
			}
			start_time = new Date();
			window.onscroll = function(){
				for(i=0;i<element_objects.length;i++)
				{	
					element_objects[i].is_inside_viewport();
				}
			};
		}

		
		this.getAnalyzedData = function(){
			prepare_data();
			return analyzed_list;
		}

		var prepare_data = function()
		{	var end_time = new Date();
			analyzed_list = [];
			var ts = Math.round((end_time.getTime()-start_time.getTime())/1000);
			for(i=0;i<element_objects.length;i++)
			{	
				var min = element_objects[i].visible_time/60;
				var data = {
					'element': element_objects[i].element,
					'visible-counts':element_objects[i].visible_counts,
					'visible-time':element_objects[i].visible_time,
					'total-visible_counts': total_scroll_counts,
					'total-time':{'minutes': Math.floor(ts/60),'seconds':ts%60},
					'engagement_rate_percentage':(element_objects[i].visible_counts/total_scroll_counts)*100,
				}
				analyzed_list.push(data);
			}	
		}
	};

	return {
		create: function(){
			if(instance == null){
				instance = new AnalysisManager();
				return instance;
			}
			else{
				return instance;
			}
		}
	};
})();


