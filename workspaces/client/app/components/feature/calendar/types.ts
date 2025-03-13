export type TCalendarState = {
	year: number;
	month: number;
};

export type TCalendarCell =
	| {
			type: "day";
			year: number;
			month: number;
			day: number;
			idx: number;
			label?: string;
	  }
	| {
			type: "empty";
			idx: number;
	  };

export type TCalendarRow = {
	id: string;
	cells: TCalendarCell[];
};
