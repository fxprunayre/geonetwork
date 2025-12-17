export const formatNumber = (value: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

export const SURVAL_UUID = 'cf5048f6-5bbf-4e44-ba74-e6f429af51ea';

export const AGGREGATION_LABEL_REGEX = /.+ \([\d,]+\)/;
