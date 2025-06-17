import InfoBoxWithLink from '../shared/info-box/InfoBoxWithLink';

import { useTranslation } from 'next-i18next';

const ExploreCourseBox = () => {
  const { t, ready } = useTranslation(['company']);

  return (
    <>
      <InfoBoxWithLink
        primaryText={ready ? t('companyCourseInfoBoxPrimaryText') : ''}
        secondaryText={ready ? t('companyCourseInfoBoxSecondaryText') : ''}
        link={`/course/list`}
      />
    </>
  );
};

export default ExploreCourseBox;
