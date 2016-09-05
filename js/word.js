H5P.WordSearch.Word = function (parameters, i) {
	var self = this;
	
	var word = parameters;
	var length = word.length;
	var index = i;
	var dir = undefined;
	
	self.getWord = function () {
		return word;
	};
	self.getLength = function () {
		return length;
	}
	self.getPos = function () {
		return pos;
	}
	self.getDir = function () {
		return dir;
	}
	self.getIndex = function () {
		return index;
	}
}