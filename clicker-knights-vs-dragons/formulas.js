window.formatNumber = function(num)
{
	var count = 0;
	while(num >= 1000)
	{
		num /= 1000;
		count++;
	}
	num = +(num).toFixed(2);
	
	var exp = "+e" + count*3;
	if(count < 31){
		if(count == 0) {
			exp = "";
		} else if(count == 1) {
			exp = "k";
		} else if(count == 2) {
			exp = "m";
		} else if(count == 3) {
			exp = "b";
		} else if(count == 4) {
			exp = "t";
		} else {
			exp = String.fromCharCode(97 + count - 5) + String.fromCharCode(97 + count - 5);
		}
	}
	
	return num+exp;
}