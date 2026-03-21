import { useNavigate } from "react-router-dom";

function CourseCard({
  title,
  description,
  image,
  category,
  rating,
  students,
  duration,
  price,
}) {
  const navigate = useNavigate();

  return (
    <div className="course-card">
      <div className="course-image-box">
        <img src={image} alt={title} className="course-card-image" />
      </div>

      <div className="course-card-content">
        <span className="course-category">{category}</span>
        <h3>{title}</h3>
        <p>{description}</p>

        <div className="course-meta">
          <span>⭐ {rating}</span>
          <span>👨‍🎓 {students}</span>
          <span>⏱ {duration}</span>
        </div>

        <div className="course-footer">
          <h4>{price}</h4>
          <button onClick={() => navigate("/payment")}>Enroll Now</button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;