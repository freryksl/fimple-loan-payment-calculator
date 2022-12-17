import { useState, useContext, useImperativeHandle, forwardRef } from "react"
import { AppContext, BodyContext } from "./context.js"
import {Modal} from "react-bootstrap"

const Table = ({props},ref) => {
    const appContext = useContext(AppContext)
    const bodyContext = useContext(BodyContext)
    const loanDocument = bodyContext.loanDocument
    const resultTable = loanDocument.payments
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    useImperativeHandle(ref, () => {
        return {
            showTable: () => setShow(true) /* When pressed payment plan button on body component, it triggers plan modal to open */
        }
    })
    return(
            <Modal show={show} onHide={handleClose}>
            <Modal.Header>
                <Modal.Title>Payment Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <table className="table table-bordered table-striped text-center">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Payment No</th>
                                <th scope="col">Payment Amount</th>
                                <th scope="col">Principal</th>
                                <th scope="col">Interest</th>
                                {loanDocument.taxes?.map((elem, index) => {
                                    return <th key={`tax-title-${index}`} scope="col">{elem.taxName}</th>
                                })}
                                <th scope="col">Remain Principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultTable?.map((elem, index) => {
                                return(
                                    <tr key={index}>
                                        <th scope="row">{elem.paymentNo}</th>
                                        <td>{bodyContext.currencyFormatter(elem.paymentVal)}</td>
                                        <td>{bodyContext.currencyFormatter(elem.remainPrincipal)}</td>
                                        <td>{bodyContext.currencyFormatter(elem.interest)}</td>
                                        {elem.taxes?.map((val, taxIndex) => {
                                            return <td key={`tax-${taxIndex}`}>{bodyContext.currencyFormatter(val)}</td>
                                        })}
                                        <td>{bodyContext.currencyFormatter(Math.abs(elem.remainTotalPrincipal))}</td>
                                    </tr>)
                            })}
                            {resultTable?.length > 0 ? <tr className="table-dark">
                                <th scope="row">Total</th>
                                <th scope="row">{bodyContext.currencyFormatter(appContext.totalRows(resultTable, "paymentVal"))}</th>
                                <th scope="row">{bodyContext.currencyFormatter(appContext.totalRows(resultTable, "remainPrincipal"))}</th>
                                <th scope="row">{bodyContext.currencyFormatter(appContext.totalRows(resultTable, "interest"))}</th>
                                {loanDocument.taxes.map((val, index) => {
                                    let taxes = []
                                    resultTable.map(elem => taxes.push(elem.taxes.at(index)))
                                    return <th key={`taxTotal-${index}`} scope="row">{bodyContext.currencyFormatter(appContext.sum(taxes))}</th>
                                })}
                                <th scope="row">-</th>
                            </tr> : <></>}
                        </tbody>
                    </table>
            </Modal.Body>
      </Modal>
    )
    
}

export default forwardRef(Table)