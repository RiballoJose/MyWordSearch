var H5P = H5P || {};

var self;
var TOTAL = 0;//cells number
var REST = 0;
var PREV_R = -1;//previous row
var PREV_C = -1;//previous column

function onClick(r, c, ac_index, dw_index){
	
	if(PREV_R != -1 && PREV_C != -1){
		//H5P.jQuery("#input_"+r+"_"+c).addClass("focused");
		if(PREV_R == r && PREV_C != c){
			if(H5P.jQuery("#input_"+r+"_"+c).hasClass("end_across") && H5P.jQuery("#input_"+PREV_R+"_"+PREV_C).hasClass("start_across")){
				for(var i = PREV_C; i <= c; i++){
					H5P.jQuery("#input_"+r+"_"+i).addClass("solved");
				}
				REST--;
				H5P.jQuery("span.ac_word"+ac_index).addClass("line-through");
			}
		}
		else if(PREV_R != r && PREV_C == c){
			if(H5P.jQuery("#input_"+r+"_"+c).hasClass("end_down") && H5P.jQuery("#input_"+PREV_R+"_"+PREV_C).hasClass("start_down")){
				for(var i = PREV_R; i <= r; i++){
					H5P.jQuery("#input_"+i+"_"+c).addClass("solved");
				}
				REST--;
				H5P.jQuery("span.dw_word"+dw_index).addClass("line-through");
			}
		}
		H5P.jQuery("#input_"+PREV_R+"_"+PREV_C).removeClass("focused");
		PREV_R = -1; PREV_C = -1;	
	}
	else{
		H5P.jQuery("#input_"+r+"_"+c).addClass("focused");
		PREV_R = r; PREV_C = c;
	}
}

function check(){
	if (REST<1){
		(H5P.jQuery(".hide.solved")).removeClass("hide");
		alert("Enhorabuena! Has completado el crucigrama");//**cambiar este alert
		self.score(10-(10*REST/TOTAL),10, 'completed');
	}
	else {
		alert(REST);
		self.score(10-(10*REST/TOTAL),10, 'completed');
	}
}
var normalize = (function() {//funcion obtenida de http://www.etnassoft.com/2011/03/03/eliminar-tildes-con-javascript/
	var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
		to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
		mapping = {};

	for(var i = 0, j = from.length; i < j; i++ )
		mapping[ from.charAt( i ) ] = to.charAt( i );

	return function( str ) {
		var ret = [];
		for( var i = 0, j = str.length; i < j; i++ ) {
			var c = str.charAt( i );
			if( mapping.hasOwnProperty( str.charAt( i ) ) )
				ret.push( mapping[ c ] );
			else
				ret.push( c );
		}      
		return ret.join( '' );
	}
})();

H5P.WordSearch = (function (EventDispatcher, $) {

	function WordSearch(parameters, id){
		self = this;
		EventDispatcher.call(self);
		
		TOTAL = REST = parameters.words.length;
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var cross = new WordSearch.CrossWord(parameters.words, id);
		var min_size = 0;
		switch(parameters.difficulty){
			case("easy"):
				min_size = 10;
			break;
			case("normal"):
				min_size = 15;
			break;
			case("hard"):
				min_size = 20;
			break;
		}	
				
		self.score = function (score, max, label){
			var xAPIEvent = this.createXAPIEventTemplate('answered');
			xAPIEvent.setScoredResult(score, max, label);
			this.trigger(xAPIEvent);
		}
		self.attach = function($container) {
			var show_answers = true;
			grid = cross.getSquareGrid(20, min_size);
			if(grid){
				legend = cross.getLegend(grid);
				var html = "";
				html += '<div class="crossword"><table>';
				this.triggerXAPI('attempted');
				for (var r = 0; r < grid.length; r++){
					html += "<tr>";
					for (var c = 0; c < grid[r].length; c++){
						var label = 0;
						var cell = grid[r][c];
						var ac = "";
						var dw = "";
						var ac_index = -1;
						var dw_index = -1;
						var char;
						html += "<td class='no-border "+r+"_"+c+"'>";
						
						if(cell == null){
							char = chars.charAt(Math.floor(Math.random()*chars.length));
						}
						else{
							if (cell['across']){
								ac_index = cell['across']['index'];
								if(cell['across']['is_start_of_word'])
									ac = "start_across";
								else if (cell['across']['is_end_of_word'])
									ac = "end_across";
							}
							if (cell['down']){
								dw_index = cell['down']['index'];
								if(cell['down']['is_start_of_word'])
									dw = "start_down";
								else if (cell['down']['is_end_of_word'])
									dw = "end_down";
							}
							char = cell['char'].toUpperCase();
						}
						//console.log(index);
						html += ('<div class="letter '+ac+' '+dw+' ac_word'+ac_index+' dw_word'+dw_index+'" id ="input_'+r+'_'+c+
						'" onclick="onClick('+r+', '+c+', '+ac_index+', '+dw_index+')">'+char+'</div>');
						html+= "</td>";
					}
					html += "</tr>";
				}
				html += "</table></div>";
				html += "<div id = 'legend'><div id=help><p>Para jugar pulse primero la primera letra de la palabra "+
						"buscada y posteriormente la última sin dejar pulsado el ratón."
				var across = "<div class = across-legend ><h2> HORIZONTALES: </h2>";
				var down = "<div class = down-legend ><h2> VERTICALES: </h2>";
				var n = 1;
				for (var i = 0; i < legend.across.length; i++){
					across += "<span class=\"ac_word"+legend.across[i].index+"\">"+n + ".- " + legend.across[i].word+"</span><br>";
					n++;
				}
				html+=across + '</div>';
				n = 1;
				for (var i = 0; i < legend.down.length; i++){
					down += "<span class=\"dw_word"+legend.down[i].index+"\">"+n + ".- " + legend.down[i].word+"</span><br>";
					n++;
				}
				html+=down + '</div>';
				$(html).appendTo($container);
				$('<div class="h5p-question-buttons h5p-question-visible" style="max-height: 3.1875em;">'+
				'<button class="h5p-question-check-answer h5p-joubelui-button" type="button" '+
				'onClick="check()">Evaluar</button></div>').appendTo($container);
			}
			else{
				alert("Por desgracia no se ha podido generar la sopa de letras. Por favor, refresque la página.");
			}
		}
	}
		
	WordSearch.prototype = Object.create(EventDispatcher.prototype);
	WordSearch.prototype.constructor = WordSearch;

	return WordSearch;
	
})(H5P.EventDispatcher, H5P.jQuery);