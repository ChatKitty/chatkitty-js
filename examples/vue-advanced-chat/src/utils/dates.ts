const zeroPad = (num: number, pad: number) => {
	return String(num).padStart(pad, '0');
};

const isSameDay = (d1: Date, d2: Date) => {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
};

export const parseTimestamp = (timestamp: string, format = '') => {
	if (!timestamp) return;

	const date = new Date(timestamp);

	if (format === 'HH:mm') {
		return `${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}`;
	} else if (format === 'DD MMMM YYYY') {
		const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric', day: 'numeric' };
		return `${new Intl.DateTimeFormat('en-GB', options).format(date)}`;
	} else if (format === 'DD/MM/YY') {
		const options: Intl.DateTimeFormatOptions = {
			month: 'numeric',
			year: 'numeric',
			day: 'numeric',
		};
		return `${new Intl.DateTimeFormat('en-GB', options).format(date)}`;
	} else if (format === 'DD MMMM, HH:mm') {
		const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
		return `${new Intl.DateTimeFormat('en-GB', options).format(date)}, ${zeroPad(
			date.getHours(),
			2,
		)}:${zeroPad(date.getMinutes(), 2)}`;
	}

	return date;
};

export const formatTimestamp = (date: Date, timestamp: string) => {
	const timestampFormat = isSameDay(date, new Date()) ? 'HH:mm' : 'DD/MM/YY';
	const result = parseTimestamp(timestamp, timestampFormat);
	return timestampFormat === 'HH:mm' ? `Today, ${result}` : result;
};
