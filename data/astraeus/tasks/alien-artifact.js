
///////////////////////////////////////////// ALIEN ARTIFACT ///////////////////////////////////


var topsecretcode = '\
<button class="backbutton" onmousedown="playRandomSound()" style="left: 27px; width: 59px; height: 41px; top: 86px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
		<button class="backbutton" onmousedown="playRandomSound()" style="left: 372px; width: 154px; height: 20px; top: 556px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
		<div style="position: absolute; left: 300; top: 100; color: red; font-size: 2em">RESTRICTED ACCESS</div>\
		<div class="keypad">\
	<button class="keypadbutton" onClick="InputButton(\'Vargas\');">Vargas</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Holtz\');">Holtz</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'Buchanan\');">Buchanan</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Shimaki\');">Shimaki</button>\
	<button class="keypadbutton"  onClick="InputButton(\'-\');">-</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'1\');">1</button>\
	<button class="keypadbutton"  onClick="InputButton(\'2\');">2</button>\
	<button class="keypadbutton"  onClick="InputButton(\'3\');">3</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'4\');">4</button>\
	<button class="keypadbutton"  onClick="InputButton(\'5\');">5</button>\
	<button class="keypadbutton"  onClick="InputButton(\'6\');">6</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'7\');">7</button>\
	<button class="keypadbutton"  onClick="InputButton(\'8\');">8</button>\
	<button class="keypadbutton"  onClick="InputButton(\'9\');">9</button>\
	<button class="keypadbutton"  onClick="InputButton(\'0\');">0</button>\
	<button class="keypadbutton"  onClick="ClearButton();">Clear</button>\
	<form id="question1"><input type="text" id="fname"></form>\
	<button class="keypadsubmit"  class="button" onclick="AccessCode()">Submit</button><p id="response"></p><p id="next"></p></div>\
		';

var xenothianartifacts = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Artifacts</div>\
		<div class="dataimage"><img class="dataimg" src="images/xenothianartifact.png"></div>\
		<div class="datacontent">\
			<img class="badge" src="images/inbibibadge.png">XENOSPACE OPERATOR: INBIBI ASOON\
		<br /><br />Captain Vargas has revealed the secret of the discovered obelisk-shaped, alien artifact to me and I have been studying it in order to obtain the new Xenospace Configuration from the alien data contained within.\
		<br /><br />The following information contains my research.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'xenothianartifactsmore\');">Next</button>';
	

		var xenothianartifactsmore = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Artifacts</div>\
		<div class="dataimage"><img class="dataimg" src="images/xenothianartifact1.png"></div>\
		<div class="datacontent">\
		The artifact has four sides. Each side has a color at the base (this will be used later to set the lucidte crystal) and an unknown alien language.  This language can be deciphered using a Universal Translation Visor and it reveals two rows of numbers (you may need to turn on the red lights to better see the numbers)\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'xenothianartifacts\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiA\');">Next</button>';
	
	
					var inbibiA = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiA.png"></div>\
		<div class="datacontent">\
		Go to “Xenospace Drive” on a Data Terminal where you can input these numbers as a horizontal row and a vertical column.  You will also need to select the correct color for these inputs.  Select the same color that is on the base of the artifact.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'xenothianartifactsmore\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiB\');">Next</button>';
	
	
	
					var inbibiB = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiB.png"></div>\
		<div class="datacontent">\
		Next you will need to complete the configuration matrix with the data you provided.  Click the cells in the matrix to fill them in.  The numbers indicate a contiguous group of cells. The numbers above correspond to columns, the numbers on the left correspond to rows.<br /><br />\
		I will provide some tips at the end for how to do this.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiA\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiC\');">Next</button>';
	
	
	
	
	
					var inbibiC = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiC.png"></div>\
		<div class="datacontent">\
		When you have correctly filled out the entire shape, the resulting image is the shape and position of the Lucidite required for the Xenospace Configuration.<br \><br \>\
		Place a Lucidite crystal of the same shape and positioned the same way in any of the four drive slots on top.  Finally use the pad to change the color of the crystal to be the same as in your completed shape. <br \><br \>\
		(As I write this, the ship currently has no Lucidite or else I would input the configuration myself!)\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiB\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiD\');">Next</button>';
	
						var inbibiD = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiD.png"></div>\
		<div class="datacontent">\
		You will need to do this four times.  Once four pieces of Lucidite are placed correctly in the four drives and each are set to their correct colors, you can press the green button to attempt a Xenospace Jump.<br /><br />\
		Next I have some tips for helping you complete the matrix.  If you feel confident that you already understand what to do, then you can ignore them.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiC\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiE\');">Tips</button>';
	
	
	
						var inbibiE = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiE.png"></div>\
		<div class="datacontent">\
		The numbers indicate a contiguous group of cells. The numbers above correspond to columns, the numbers on the left correspond to rows. It’s best to start with the largest number in the matrix.<br /><br />\
		For example, this column says it has 8 contiguous cells.  But we do not know where in the column the sequence begins.  There are three possibilities.  But we should not fill any cells we are not certain should be filled.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiD\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiF\');">Next</button>';
	
	
						var inbibiF = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiF.png"></div>\
		<div class="datacontent">\
		It’s possible the sequence begins on the first cell, leaving the final two cells empty.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiE\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiG\');">Next</button>';
	
	
	
						var inbibiG = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiG.png"></div>\
		<div class="datacontent">\
		But it’s also possible the sequence begins on the third cell, leaving the first two cells empty.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiF\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiH\');">Next</button>';
		
		
		
						var inbibiH = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiH.png"></div>\
		<div class="datacontent">\
		However, no matter where in the column the sequence begins, we can deduce that the middle six cells will be filled. <br \><br \> So we can go ahead and fill only these cells in and leave the others untouched for now.  We will finish the column once we have deduced more information. \
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiG\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiI\');">Next</button>';
		
		
		
		
						var inbibiI = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiI.png"></div>\
		<div class="datacontent">\
		Next we see we have a row that has 3 cells.  Again we do not know where the sequence begins in this row of 10 cells.  However, we do know where the cells cannot possibly be.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiH\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiJ\');">Next</button>';
		
		
		
						var inbibiJ = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiJ.png"></div>\
		<div class="datacontent">\
		Because we already filled out one of the cells in this row previously, and we know the sequence is 3 cells, it is not possible for the sequence to begin in some of these squares. <br \><br \>\
		I have changed my marker to the “X” to indicate where cells cannot possibly exist.  This will be helpful in further deductions, but it is not required to put an “X” where cells do not exist.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiI\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiK\');">Next</button>';
		
		
						var inbibiK = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiK.png"></div>\
		<div class="datacontent">\
		Next look at this column where there are 5 contiguous cells.  We already deduced that there cannot be a filled cell in column 6.  So there is only one way that 5 contiguous cells will fit in this column.  Can you see how? <br /> <br />\
		When the shape is completed correctly, the system will tell you.  If you wish to see how many current squares are colored incorrectly, click on "Show Mistakes"\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiJ\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiL\');">Next</button>';
		
		
						var inbibiL = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibiL.png"></div>\
		<div class="datacontent">\
	The first five cells are the only place available for a column of 5 contiguous cells.  The cells cannot go on the “X” and there are only four cells after the “X”.  That’s not enough room.<br /><br />\
	We can also add "X"s below our column of 5 contiguous cells since we know the column is complete.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiK\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiM\');">Next</button>';
		
		
						var inbibiM = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi.png"></div>\
		<div class="datacontent">\
	Remember that your deductions are based on previous deductions.  So if you “guess” you could end up in the wrong direction.  The data terminal will let you know when the shape is filled out correctly.<br /><br />\
Now I must follow THE ORDERS OF CAPTAIN VARGAS AND FLEE THE SHIP VIA ESCAPE CAPSULE. I HOPE THAT I WILL SURVIVE IN ORDER TO SOME DAY DISCOVER WHERE THE XENOSPACE CONFIGURATION ON THE ARTIFACT WOULD ULTIMATELY LEAD… Or perhaps you will instead?<br /><br />\
-INBIB ASOON\
	</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibiK\');">Back</button>';
		
		
	
	
				var inbibi2 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi2.png"></div>\
		<div class="datacontent">\
		I have written the two rows of numbers from the side of the artifact with the orange base on the rows and columns of the configuration like so.\
		<br /><br />The configuration matrix is a tool used to actualize the shape and position of the required lucidite crystal used in the xenospace configuration.  By placing the pegs in the matrix correctly according to these numbers, we will reveal the required lucidite crystal.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'xenothianartifactsmore\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi3\');">Next</button>';
	
					var inbibi3 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi3.png"></div>\
		<div class="datacontent">\
		The matrix is a 10 by 10 grid. The numbers in the rows and columns indicate there is a consecutive sequence of that many pegs.\
		<br /><br />It is easier to start with the largest numbers first.  A column here contains 10 consecutive pegs. Since the matrix is 10 spaces long, there is no question where the sequence of 10 pegs starts.  I place the pegs like so.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi2\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi4\');">Next</button>';
	
						var inbibi4 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi4.png"></div>\
		<div class="datacontent">\
		Next, there is a sequence of 8 consecutive pegs. It’s possible that these 8 pegs appear here, starting in the first space.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi3\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi5\');">Next</button>';
	
							var inbibi5 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi5.png"></div>\
		<div class="datacontent">\
		Or they could appear here, starting in the second space…\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi4\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi6\');">Next</button>';
	
								var inbibi6 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi6.png"></div>\
		<div class="datacontent">\
		Or they could appear here, starting in the third space…\
<br /><br />THESE ARE THE ONLY POSSIBILITIES FOR A CONSECUTIVE SEQUENCE OF 8 PEGS. It is generally a good idea not to place any pegs unless I can be certain they go in a space, otherwise I could create error.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi5\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi7\');">Next</button>';
	
								var inbibi7 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi7.png"></div>\
		<div class="datacontent">\
			But EVEN THOUGH I DO NOT KNOW WHERE THE 8 PEGS START, I CAN BE SURE THAT REGARDLESS OF WHICH OF THOSE THREE POSSIBILITIES IS CORRECT, AT LEAST 6 OF THE PEGS CAN BE PLACED WITH ABSOLUTE CERTAINTY. \
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi6\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi8\');">Next</button>';
	
									var inbibi8 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi8.png"></div>\
		<div class="datacontent">\
		So I place the only six pegs that I know must be present.  Later, when I have more information, I will place the rest of the pegs.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi7\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi9\');">Next</button>';
	
		var inbibi9 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi9.png"></div>\
		<div class="datacontent">\
		Here I have progressed and I wish to try to place pegs in this column that has 3 consecutive pegs. I have already placed a peg in this column from a previous move.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi8\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi10\');">Next</button>';
	
		var inbibi10 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi10.png"></div>\
		<div class="datacontent">\
		There are a few ways that 3 consecutive pegs could be placed, but I don\'t have enough information to place any of them.  <br /><br />However, because I know that the three pegs include this peg already placed, I can see where there could not possibly be a peg.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi9\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi11\');">Next</button>';
	
	
		var inbibi11 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi11.png"></div>\
		<div class="datacontent">\
		So instead I place <font color="white">white pegs</font> in spaces to mark where no orange peg can be. This will help me later on other moves because they will block some possibilities.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi10\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi16\');">Next</button>';


		var inbibi16 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi16.png"></div>\
		<div class="datacontent">\
		AS I CONTINUE TO WORK, I ULTIMATELY PLACE ALL THE ORANGE PEGS CORRECTLY AND THE SHAPE OF THE LUCIDITE IS REVEALED.\
			</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi8\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi17\');">Next</button>';
	
		var inbibi17 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi17.png"></div>\
		<div class="datacontent">\
			WE HAVE ONE PIECE OF LUCIDITE THAT, WHEN TURNED AND ROTATED CORRECTLY, RESEMBLES THE SHAPE I ACTUALIZED WITH THE CONFIGURATION MATRIX. I PLACE THIS IN THE DRIVE SLOT ON TOP.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi16\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi18\');">Next</button>';
	
		var inbibi18 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi18.png"></div>\
		<div class="datacontent">\
			WHILE THE LUCIDITE IS NOT SHAPED PERFECTLY, IT IS IMPORTANT TO BE ABLE TO SEE HOW ITS SHAPE CONSISTS OF SMALLER SQUARES THAT MATCH THE PEGS ON THE CONFIGURATION MATRIX\
			</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi17\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi19\');">Next</button>';
	
		var inbibi19 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi19.png"></div>\
		<div class="datacontent">\
			ALSO, I MUST USE THE CHROMA CALIBRATOR TO SET THE CORRECT COLOR. WE KNOW FROM THE XENOTHIAN ARTIFACT THAT THIS SHAPE IS ORANGE.\
<br /><br />I have now completed one of the four parts of this xenospace configuration. \
<br /><br />Keep in mind the Configuration Matrix is only a tool to see the shape of the lucidite crystal that must be placed.  Not all, or any, of the pegs must be placed for the drive to work.  Only the placement of the crystals matters.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi18\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi20\');">Next</button>';
	
	
			var inbibi20 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenothian <br />Operations</div>\
		<div class="dataimage"><img class="dataimg" src="images/inbibi.png"></div>\
		<div class="datacontent">\
			SADLY, I WILL NOT BE ABLE TO COMPLETE THE XENOSPACE CONFIGURATION BECAUSE WE lost the rest of our lucidite in the urbraxian attack. WE HAVE LAUNCHED PROBES TO SEARCH NEARBY SPACE FOR LUCIDITE BUT so far NO LUCIDITE HAS BEEN DISCOVERED.	\
			<br /><br />WITH NO OTHER CHOICE, I AM FOLLOWING THE ORDERS OF CAPTAIN VARGAS AND FLEEING THE SHIP VIA ESCAPE CAPSULE. I hope that I will survive in order to some day discover where the xenospace configuration on the artifact would ultimately lead…\
			<br /><br />-INBIB ASOON\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'inbibi19\');">Back</button>';