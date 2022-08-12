import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";

export const Wrapper = styled.div`
  font-size: 14px;
  box-sizing: border-box;
  position: fixed;
  z-index: 999999;
  color: #ffffff;
`;

interface IToastElement {
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}
export const ToastElement = styled.div<IToastElement>`
  background-color: #000;
  transition: 0.3s ease;
  position: relative;
  pointer-events: auto;
  overflow: hidden;
  margin: 0 0 6px;
  margin-bottom: 15px;
  border-radius: 3px 3px 3px 3px;
  box-shadow: 0 0 10px #999;
  color: #ffffff;
  opacity: 0.9;
  background-position: 15px;
  background-repeat: no-repeat;
  width: 400px;
  padding: 20px 15px 10px 10px;
  top: ${({ position }) => {
    if (position === "top-right" || position === "top-left") {
      return "12px";
    } else {
      return "0;";
    }
  }};
  right: ${({ position }) => {
    if (position === "top-right" || position === "bottom-right") {
      return "12px";
    } else {
      return "0";
    }
  }};
  transition: ${({ position }) => {
    if (position === "top-right" || position === "bottom-right") {
      return "transform 0.6s ease-in-out";
    } else {
      return "transform 0.6s ease-in";
    }
  }};
  animation: ${({ position }) => {
    if (position === "top-right" || position === "bottom-right") {
      return css`
        ${toastInRight} 0.7s
      `;
    } else {
      return css`
        ${toastInLeft} 0.7s
      `;
    }
  }};
`;

export const ImageWrapper = styled.div`
  float: left;
  margin-right: 15px;
  img {
    width: 24px;
    height: 24px;
  }
`;

export const Main = styled.div``;

export const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  text-align: left;
  margin-top: 0;
  margin-bottom: 6px;
  width: 300px;
  height: 18px;
`;

export const Body = styled.div`
  margin: 0;
  text-align: left;
  height: 18px;
  margin-left: -1px;
  text-overflow: wrap;
  white-space: nowrap;
`;

const toastInRight = keyframes`
  
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const toastInLeft = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;
