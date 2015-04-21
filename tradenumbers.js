/*jslint vars: true, white: true */
var TradeNumbers = (function () {
	"use strict";
	
	var GTIN = {
		calcCheckDigit: function (noCheck) {
			var padded = new Array(17 - noCheck.length)
				.join('0')
				.split('')
				.concat(noCheck);
			var i;
			var sum = 0;
			for (i = 0; i < padded.length; i += 1) {
				sum += ((i % 2 * 2) + 1) * (parseInt(padded[i], 10) || 0);
			}
			var result = Math.ceil(sum / 10) * 10 - sum;
			
			return result;
		},
		isValid: function (withCheck) {
			withCheck = String(withCheck);
			if (!/^\d+$/.test(withCheck)) {
				return false;
			}
			var noCheck = withCheck.split('');
			var checkDigit = parseInt(noCheck.pop(), 10);
			return checkDigit === GTIN.calcCheckDigit(noCheck);
		}
	};
	
	var ISBN = {
		isbn10to13: function (digits) {
			var noCheck = '978' + String(digits).slice(0, 9);
			return noCheck + GTIN.calcCheckDigit(noCheck);
		},
		isbn13to10: function (digits) {
			var sub = String(digits).substring(3, 12);
			return sub + ISBN.calcCheckDigit(sub);
		},
		calcCheckDigit: function (noCheck) {
			var i;
			var sum = 0;
			
			for (i = 0; i < noCheck.length; i += 1) {
				sum += (i + 1) * (parseInt(noCheck[i], 10) || 0);
			}
			
			var result = sum % 11;
			
			if (result === 10) {
				return 'X';
			}
			
			return result;
		},
		isValid: function (withCheck) {
			withCheck = String(withCheck);
			if (!/^\d+[xX]?$/.test(withCheck)) {
				return false;
			}
			if (withCheck.length === 13) {
				if (/^(978|979)/.test(withCheck)) {
					return GTIN.isValid(withCheck);
				}
				return false;
			}
			var noCheck = withCheck.split('');
			var popped = noCheck.pop().toUpperCase();
			var checkDigit = parseInt(popped, 10);
			if (isNaN(checkDigit) && (popped === 'X')) {
				checkDigit = 'X';
			}
			return checkDigit === ISBN.calcCheckDigit(noCheck);
		}
	};
	var self = {
		GTIN: {
			calcCheckDigit: function (noCheck) {
				return GTIN.calcCheckDigit(String(noCheck).split(''));
			},
			isValid: GTIN.isValid
		},
		ISBN: {
			isbn10to13: ISBN.isbn10to13,
			isbn13to10: ISBN.isbn13to10,
			calcCheckDigit: function (noCheck) {
				if (noCheck.length === 9) {
					return ISBN.calcCheckDigit(String(noCheck).split(''));
				}
				if (noCheck.length === 12) {
					return GTIN.calcCheckDigit(String(noCheck).split(''));
				}
				throw 'To generate a check digit a candidate ISBN number must be either 9 or 12 characters long.';
			},
			isValid: ISBN.isValid
		},
		classify: function (digits) {
			digits = String(digits);
			function notValid() {
				return false;
			}
			var type = 'unknown';
			var validator = notValid;
			switch (digits.length) {
			case 14:
				type = 'GTIN-14';
				validator = GTIN.isValid;
				break;
			case 13:
				switch (digits.substring(0, 3)) {
				case '978':
					type = 'ISBN-13/GTIN-13/EAN-13';
					validator = ISBN.isValid;
					break;
				case '979':
					type = 'ISBN-13/GTIN-13/EAN-13';
					validator = ISBN.isValid;
					break;
				default: 
					type = 'GTIN-13/EAN-13';
					validator = GTIN.isValid;
				}
				break;
			case 10:
				type = 'ISBN-10';
				validator = ISBN.isValid;
				break;
			case 12:
				type = 'GTIN-12/UPC-A';
				validator = GTIN.isValid;
				break;
			case 8:
				type = 'GTIN-8/EAN-8';
				validator = GTIN.isValid;
				break;
			}
			if (!validator(digits)) {
				return 'unknown';
			}
			return type;
		}
	};
	return self;
}());

