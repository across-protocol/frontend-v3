import styled from "@emotion/styled";

export const Wrapper = styled.div`
  width: 100%;
  padding-bottom: 2rem;
`;

export const PaginationElements = styled.div`
  display: flex;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
`;

interface IElementWrapper {
  active?: boolean;
}

export const ElementWrapper = styled.div<IElementWrapper>`
  background-color: ${({ active }) => (active ? "#565757" : "#2C2F33")};
  color: #fffefe;
  border: 1px solid #565757;
  height: 30px;
  width: 30px;
  border-radius: 6px;
  text-align: center;
  margin: 0 3px;
  font-size: ${16 / 16}rem;
  align-items: center;
  &:first-of-type {
    margin-right: 12px;
  }
  &:last-of-type {
    margin-left: 12px;
  }
  &:hover {
    opacity: 0.7;
    background-color: #565757;
    cursor: pointer;
  }
`;

interface INextWrapper {
  disabled?: boolean;
}

export const NextElement = styled.div<INextWrapper>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fffefe;
  height: 32px;
  width: 32px;
  &:hover {
    cursor: pointer;
  }
`;
