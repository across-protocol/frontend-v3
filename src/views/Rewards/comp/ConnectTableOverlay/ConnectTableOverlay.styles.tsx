import styled from "@emotion/styled";
import { SecondaryButtonWithoutShadow } from "components/Buttons";
import { COLORS } from "utils";

export const Overlay = styled.div`
  position: absolute;
  width: 100%;
  max-width: 1400px;
  left: 11%;
  text-align: center;
  height: 200px;
  background-color: hsla(${COLORS.gray[500]} / 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 500px;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
`;

export const ConnectButton = styled(SecondaryButtonWithoutShadow)`
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  height: 55px;
`;
