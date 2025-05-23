import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import Icon from "../icon/Icon";

const TooltipComponent = ({ iconClass, icon, id, direction, text, containerClassName, ...props }) => {
  const timeout = props.timeout !== undefined ? props.timeout : 300;

  return (
    <React.Fragment>
      {props.tag ? (
        <props.tag className={containerClassName} id={id}>
          {" "}
          <Icon className={`${iconClass ? iconClass : ""}`} name={icon}></Icon>
        </props.tag>
      ) : (
        <Icon className={`${iconClass ? iconClass : ""}`} name={icon} id={id}></Icon>
      )}
      <UncontrolledTooltip autohide={false} placement={direction} target={id} transition={{ timeout }}>
        {text}
      </UncontrolledTooltip>
    </React.Fragment>
  );
};

export default TooltipComponent;