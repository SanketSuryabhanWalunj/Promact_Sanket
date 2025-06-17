import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
 
import ExploreCourseItem from "./ExploreCourseItem";
import {
  ExploreCourseItemType,
  UserSubscribedCourseType,
} from "../../types/courses";
 
import { useTranslation } from "next-i18next";
 
const ExploreCourseList = (props: {
  courses: ExploreCourseItemType[],
  userCourses: UserSubscribedCourseType[],
}) => {
  const { courses, userCourses } = props;
  const userCoursesCompletedId = userCourses
    .map((c) => (c.isCompleted ? c.id : ""))
 
    .filter((item) => item != "");
  const today = new Date();
  const userCoursesId = userCourses
    .map((c) => {
      if (
        new Date(c.expirationDate) > today ||
        new Date(c.certificateExpirationDate) > today
      )
        return "";
      else return c.id;
    })
    .filter((item) => item != "");
 
  const { t, ready } = useTranslation(["course", "common"]);
 
  const examType = ["Online", "VR", "Live"];
 
  return (
    <Box>
      <Typography
        className="courses-title"
        sx={{
          color: "#666666",
          fontSize: "16px",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: "20px",
        }}
      >
        {ready && t("exploreOtherCourses")}
      </Typography>
      {courses.map((course, cIndex) =>
        examType.map((et, eIndex) => {
          const uc = userCourses.find(
            (userCourse) =>
              userCourse.id === course.id && userCourse.examType === et
          );
 
          if (uc) {
            if (
              uc.certificateExpirationDate &&
              new Date(uc.certificateExpirationDate) > new Date()
            ) {
              if (uc.isCompleted) {
                return <></>;
              } else {
                return (
                  <ExploreCourseItem
                    key={eIndex}
                    course={course}
                    purchased={true}
                    completed={false}
                    examType={et}
                  />
                );
              }
            } else if (
              !uc.certificateExpirationDate &&
              new Date(uc.expirationDate) > new Date() &&
              !uc.isCompleted
            ) {
              return (
                <ExploreCourseItem
                  key={eIndex}
                  course={course}
                  purchased={true}
                  completed={false}
                  examType={et}
                />
              );
            } else {
              return (
                <ExploreCourseItem
                  key={eIndex}
                  course={course}
                  purchased={false}
                  completed={false}
                  examType={et}
                />
              );
            }
          } else {
            return (
              <ExploreCourseItem
                key={eIndex}
                course={course}
                purchased={false}
                completed={false}
                examType={et}
              />
            );
          }
        })
      )}
    </Box>
  );
};
 
export default ExploreCourseList;