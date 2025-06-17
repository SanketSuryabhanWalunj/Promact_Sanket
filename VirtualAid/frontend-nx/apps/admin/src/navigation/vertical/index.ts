// ** Type import
import { useTranslation } from 'react-i18next';
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  const { t, ready } = useTranslation(['individualAuth','company', 'common']);
  return [
    {
      title: t('common:coursesText'),
      path: '/course/list',
      icon: 'tabler:file-certificate'
    },
    {
      title: t('common:userText'),
      icon: 'tabler:users',
      children: [
        {
          title: t('company:companiesText'),
          path: '/company/list'
        },
        {
          title: t('individualsText'),
          path: '/individual/list'
        }
      ]
    },
    {
      title: t('common:rolesAndPermission'),
      icon: 'tabler:checkup-list',
      children: [
        {
          title: t('common:adminsText'),
          path: '/roles-and-permission/admins'
        },
        {
          title: t('common:governerText'),
          path: '/roles-and-permission/governors'
        }
      ]
    },
    {
      title: t('common:reports&Analytics'),
      icon: 'tabler:report-analytics',
      children: [
        {
          title: t('common:reports&Analytics'),
          path: '/reports-and-analytics'
        }
      ]
    },
    {
      title: t('common:settingsText'),
      path: '/settings',
      icon: 'tabler:settings'
    },
    {
      title: t('common:mapText'),
      path: '/map',
      icon: 'lets-icons:map-light',
      action: 'read',
      subject: 'map-chart'
    },
    {
      title: t('common:feedBackText'),
      path: '/feedback',
      icon: 'mdi:message-alert-outline',
      action: 'read',
      subject: 'map-chart'
    }, 
    {
      title: t('common:liveExamText'),
      path: '/live-exam/list',
      icon: 'lets-icons:hourglass-light',
      action: 'read',
      subject: 'map-chart'
    },
    {
      title: t('common:liveExamRequests'),
      path: '/live-exam-request/list',
      icon: 'lets-icons:arhive-export-light',
      action: 'read',
      subject: 'map-chart'
    },
    {
      title: t('common:liveExamApproved'),
      path: '/live-exam-approved/list',
      icon: 'lets-icons:done-all-round',
      action: 'read',
      subject: 'map-chart'
    }

  ]
}

export default navigation
