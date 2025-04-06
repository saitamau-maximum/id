// dateから年度を取得する
export const getFiscalYear = (date: Date) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return year;
	}
	return year - 1;
};

// 今年度の最初の日付を取得する
export const getFiscalYearStartDate = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month >= 4) {
		return new Date(year, 3, 1);
	}
	return new Date(year - 1, 3, 1);
};

// DateをHTML5のDatePickerの形式に変換する
export const toHTMLDatePickerFormat = (date: Date) => {
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return utcDate.toISOString().slice(0, 10);
};

// DateをHTML5のTimePickerの形式に変換する
export const toHTMLDateTimePickerFormat = (date: Date) => {
	console.log(date.getTimezoneOffset());
	const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
	return utcDate.toISOString().slice(0, 16);
};
