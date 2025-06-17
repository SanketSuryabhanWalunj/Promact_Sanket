//Mui imports
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Accordion from '@mui/material/Accordion'
import Card from '@mui/material/Card'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

//React imports
import { useCallback, useEffect, useState } from 'react'

//router imports
import { useRouter } from 'next/router'

//Types imports
import { CourseDetailsType } from 'src/types/courses'
import { getCourseDetails } from 'src/api-services/CoursesApi'
import { useTranslation } from 'react-i18next'

// course details component
const CourseDetails = () => {
  const [expanded, setExpanded] = useState<number | false>(0)
  const [courseDetails, setCourseDetails] = useState<CourseDetailsType>({} as CourseDetailsType)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [isDetailsError, setIsDetailsError] = useState(false)
  const [detailsErrorMsg, setDetailsErrorMsg] = useState('')
  const router = useRouter()
  const { t, ready } = useTranslation(['course', 'common']);
  //method to get course view details
  //@param: courseId - for getting courseId wise data
  const getCourseViewDetails = useCallback(async (courseId: string) => {
    try {
      setDetailsLoading(true)
      const culture = router.locale as string;
      const response = await getCourseDetails(courseId, culture)
      if (response.status === 200) {
        setCourseDetails(response.data)
        
        setDetailsLoading(false)
        setIsDetailsError(false)
        setDetailsErrorMsg('')
      }
    } catch (error) {
      setDetailsLoading(false)
      setIsDetailsError(true)
      setDetailsErrorMsg('Something went wrong')
    }
  }, [])

  useEffect(() => {
    if (router.isReady) {
      getCourseViewDetails(router.query.id as string)
    }
  }, [router, getCourseViewDetails])

  
  //method to handle Change function for expand collapse panel
  //@param: panel - for getting panel wise expand collapse
  const handleChange = (panel: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <>
      <Container
        maxWidth='xl'
        sx={{
          padding: '0 !important'
        }}
      >
        <Card
          sx={{
            padding: { xs: '0 20px', lg: '15px 50px !important' }
          }}
        >
          <Box
            sx={{
              background: '$theme.dark'
            }}
          >
            {detailsLoading ? (
              <>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <CircularProgress />
                </Box>
              </>
            ) : (
              <>
                {isDetailsError ? (
                  <>
                    <Box display='flex' justifyContent='center' alignItems='center'>
                      <Typography variant='h5' component='div'>
                        {detailsErrorMsg}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* Course name and button */}
                    <Box
                      sx={{
                        display: { xs: 'block', md: 'flex' },
                        justifyContent: 'space-between',
                        alignItem: 'center',
                        marginBottom: '14px'
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '14px', md: '32px' },
                          marginBottom: { xs: '10px', md: '0' }
                        }}
                      >
                        {courseDetails.name}
                      </Typography>
                    </Box>

                    {/* Course description */}
                    <Box>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '12px', md: '16px' },
                          fontFamily: "'Open Sans', sans-serif",
                          margin: { xs: '10px 0', md: '30px 0 26px 0' }
                        }}
                      >
                        {courseDetails.description}
                      </Typography>
                    </Box>

                    {/* Course learning outcomes and module */}
                    <Box>
                      {/* Learning outcomes */}
                      <Grid container spacing={2} sx={{ margin: { xs: '10px 0', md: '30px 0 26px 0' } }}>
                        <Grid item xs={8}>
                          <Grid container spacing={2}>
                            {courseDetails?.learningOutcomes?.map((learningOutcome, index) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                key={index}
                                sx={{
                                  padding: '6px 0 0 16px !important',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <DoneOutlinedIcon
                                  sx={{
                                    display: 'inline-block',
                                    verticalAlign: 'top',
                                    color: 'text.secondary',
                                    marginRight: '14px'
                                  }}
                                ></DoneOutlinedIcon>
                                <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                                  {learningOutcome}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      </Grid>

                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '20px',
                          fontFamily: "'Open Sans', sans-serif",
                          marginBottom: '14px'
                        }}
                      >
                        {t('moduleCourseContent')}
                      </Typography>
                      {courseDetails?.modules?.map((courseModule, index) => (
                        <Accordion
                          key={index}
                          expanded={expanded === index}
                          onChange={handleChange(index)}
                          className='course-details-section'
                        >
                          <AccordionSummary
                            aria-controls='panel1d-content'
                            id='panel1d-header'
                            expandIcon={<Icon fontSize='1.25rem' icon='tabler:chevron-down' />}
                          >
                            <Typography sx={{ color: 'text.secondary' }}>{courseModule.name}</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ paddingTop: 0, background: '' }}>
                            <Box sx={{ marginLeft: '28px' }}>
                              {courseModule?.lessons?.map((lesson, index) => (
                                <Typography
                                  key={index}
                                  variant='body2'
                                  component='div'
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {lesson.name}
                                </Typography>
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Card>
      </Container>
    </>
  )
}

CourseDetails.authGuard = true

export default CourseDetails
