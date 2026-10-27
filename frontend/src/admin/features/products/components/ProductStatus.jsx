import { memo } from 'react';
import Pill from '../../../components/ui/Pill';
import { PRODUCT_STATUSES } from '../productConstants';

const tone = { published: 'ok', draft: 'wait', scheduled: 'wait' };

export default memo(function ProductStatus({ status }) {
  return <Pill tone={tone[status] || 'wait'}>{PRODUCT_STATUSES[status] || status}</Pill>;
});
