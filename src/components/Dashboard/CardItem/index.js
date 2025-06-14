import "./CardItem.css";

function CardItem(props) {
    const { title, icon, children, style } = props;

    return (
        <div className="card-item" style={style}>
            <div className="card-header">
                {icon && <div className="card-icon">{icon}</div>}
                <h4 className="card-title">{title}</h4>
            </div>
            <div className="card-content">
                {children}
            </div>
        </div>
    );
}

export default CardItem;
