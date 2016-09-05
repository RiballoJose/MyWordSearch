H5P.WordSearch.CrosswordCell = function (word, letter, index) {
	var self = this;
	
	self.word = word;
	self.char = letter;
	self.word_index = index;
	self.across = null;
	self.down = null;
}