import { FC } from "react";
import {
  StyledTableWrapper,
  StyledHeadRow,
  StyledBody,
  StyledRow,
  StyledCell,
  Wrapper,
  Title,
  LoadingWrapper,
  NotFoundWrapper,
} from "./TransactionsTable.styles";
import { ICell, IRow } from "components/Table/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import emptyClouds from "assets/across-emptystate-clouds.svg";

interface TxTableIRow extends IRow {
  onClick?: () => void;
}

interface Props {
  rows: TxTableIRow[];
  headers: ICell[];
  title: string;
  initialLoading: boolean;
}

const TransactionsTable: FC<Props> = ({
  rows,
  headers,
  title,
  initialLoading,
}) => {
  return (
    <Wrapper>
      {initialLoading && (
        <LoadingWrapper>
          <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" size="2x" />
          <div>Loading...</div>
        </LoadingWrapper>
      )}
      {!rows.length && !initialLoading && (
        <NotFoundWrapper>
          <img src={emptyClouds} alt="empty_state" />
          No transactions found.
        </NotFoundWrapper>
      )}
      {rows.length && !initialLoading ? (
        <>
          <Title>{title}</Title>

          <StyledTableWrapper>
            <StyledHeadRow>
              {headers.map((cell, index) => {
                return (
                  <StyledCell
                    key={index}
                    className={cell.cellClassName ?? ""}
                    size={cell.size}
                  >
                    {cell.value}
                  </StyledCell>
                );
              })}
            </StyledHeadRow>
            <StyledBody>
              {rows.length
                ? rows.map((row, ridx) => {
                    return (
                      <StyledRow key={ridx}>
                        {row.cells.map((cell, cidx) => {
                          return (
                            <StyledCell
                              className={cell.cellClassName ?? ""}
                              key={cidx}
                              size={cell.size}
                            >
                              {cell.value}
                            </StyledCell>
                          );
                        })}
                      </StyledRow>
                    );
                  })
                : null}
            </StyledBody>
          </StyledTableWrapper>
        </>
      ) : null}
    </Wrapper>
  );
};

export default TransactionsTable;
