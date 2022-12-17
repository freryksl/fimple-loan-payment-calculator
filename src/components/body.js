import { useContext, useState, useRef } from "react"
import { AppContext, BodyContext } from "./context.js"

import { TbCurrencyLira, TbPercentage, TbReceipt, TbReceiptTax, TbCalendarStats } from "react-icons/tb"
import { RiHandCoinLine } from "react-icons/ri"

import Table from "./table.js"

function Body() {
    const appContext = useContext(AppContext)
    const [principal, setPrincipal] = useState(null)
    const [multiplier, setMultiplier] = useState("")
    const [interest, setInterest] = useState(null)
    const [interestPeriod, setInterestPeriod] = useState(1)
    const [resultTable, setResultTable] = useState(null)
    const [taxes, setTaxes] = useState([])
    const [taxData, setTaxData] = useState({taxName: "", taxRate: ""})
    const [paymentFrequency, setPaymentFrequency] = useState(12)
    const [interestType, setInterestType] = useState(false)
    const [period, setPeriod] = useState(12)
    let loanDocument = useRef({
        entries: null,
        taxes: [],
        payments: []
    })
    const bodyContext = {
        /* Making numbers readable in local format */
        currencyFormatter: (val, symbol = true) => {return val.toLocaleString("tr-TR", symbol ? {style: "currency", currency: "TRY"} : {})},
        loanDocument: loanDocument.current
    }
    const tableRef = useRef()
    const CalculatePayment = () => {
        let loan = loanDocument.current
        loan.payments = []
        loan.entries = {principal: principal, multiplier: multiplier, interest: interest, interestPeriod: interestPeriod, paymentFrequency: paymentFrequency, interestType: interestType}
        /* Installment number calculated by period requested and payment frequency */
        const installmentNumber = Math.ceil(multiplier*paymentFrequency*1/period)
        /* Interest rate per installment period */
        const interestRate = (interest/100)*(interestType ? installmentNumber : 1)*(interestPeriod/paymentFrequency)
        for(let i = 0; i < installmentNumber; i++) {
            /* Previous Payment */
            const lastPayment = loan.payments.at(-1)
            let interestTax = 0
            let taxRates = []
            /* Calculation of taxes on current interest */
            loan.taxes?.forEach(tax => {
                taxRates.push(interestRate*tax.taxRate/100)
                interestTax += interestRate*tax.taxRate/100
            });
            /* Total remain principal of previous payment */
            const lastPaymentPrincipal = loan.payments.length > 0 && !interestType ? lastPayment.remainTotalPrincipal : interestType ? principal/installmentNumber : principal
            /* Sum of interest and taxes */
            const totalAmountRate = (interestRate + interestTax)
            /* Payment per installment */
            const paymentValue = interestType ? lastPaymentPrincipal*(1+totalAmountRate) : 
            lastPaymentPrincipal * ((totalAmountRate*(1+totalAmountRate)**(installmentNumber-loan.payments.length)) 
            / ((1+totalAmountRate)**(installmentNumber-loan.payments.length)-1))
            /* Remain Principal */
            const remainPrincipal = paymentValue - lastPaymentPrincipal*totalAmountRate
            /* Remain Total Principal */
            const remainTotalPrincipal = loan.payments.length > 0 ? lastPayment.remainTotalPrincipal-remainPrincipal : principal-remainPrincipal
            /* Adding calculated payment data which is for current installment */
            loan.payments.push({paymentVal: paymentValue, remainPrincipal: remainPrincipal, remainTotalPrincipal: remainTotalPrincipal, 
                paymentNo: loan.payments.length+1, interest: lastPaymentPrincipal*interestRate, taxes: taxRates.map(val => val*lastPaymentPrincipal)})
        }
        setResultTable(loan.payments)
    }
    function deleteTax(index) {
        /* Discard the tax deleted */
        loanDocument.current.taxes.splice(index, 1)
        loanDocument.current.payments.map(val => val.taxes.splice(index, 1))
        setTaxes(prev => prev.filter((_, i) => i !== index))
        /* Close calculated loan brief */
        setResultTable(null)
    }
    const regex = /^[0-9]*$/
    return(
        <div className="container">
            <div className="inner-container">
                <div className="form-grid">
                    <div className="user-input-container">
                        <div>
                            <input type="text" value={principal > 0 ? bodyContext.currencyFormatter(parseFloat(principal), false) : ""} 
                            placeholder="Principal" className="user-input" onChange={e => setPrincipal((e.target.value).replace(/[.]+/g, ""))} />
                        </div>
                        <TbCurrencyLira className="input-icons" />
                    </div>
                    <div className="user-input-container">
                        <div style={{flexDirection: "row"}}>
                            <input type="number" value={multiplier > 0 ? multiplier : ""} className="user-input" placeholder="Installment" onChange={e => {
                                regex.test(e.target.value) ? setMultiplier(e.target.valueAsNumber) 
                                : setMultiplier(Math.round(e.target.valueAsNumber))}} />
                            <select className="user-input" defaultValue="12" onChange={e => setPeriod(e.target.value)}>
                                <option value={365}>Days</option>
                                <option value={52}>Weeks</option>
                                <option value={12}>Months</option>
                                <option value={1}>Years</option>
                            </select>
                        </div>
                        <TbCalendarStats className="input-icons" />
                    </div>
                    <div className="user-input-container">
                        <div style={{flexDirection: "row"}}>
                            <input type="number" value={interest > 0 ? interest : ""} placeholder="Interest Rate" className="user-input" 
                            onChange={e => setInterest(e.target.value)} />
                            <select className="user-input" defaultValue="false" onChange={e => setInterestType(e.target.value === "true" ? true : false)}>
                                <option value={true}>Simple</option>
                                <option value={false}>Compound</option>
                            </select>
                        </div>
                        <TbPercentage className="input-icons" />
                    </div>
                    <div className="user-input-container">
                        <div style={{flexDirection: "row"}}>
                            <select className="user-input" defaultValue="1" onChange={e => setInterestPeriod(e.target.value)}>
                                <option value={1}>Annual</option>
                                <option value={12}>Monthly</option>
                                <option value={52}>Weekly</option>
                                <option value={365}>Daily</option>
                            </select>
                            <select className="user-input" defaultValue="12" onChange={e => setPaymentFrequency(e.target.value)}>
                                <option value={1}>Every Year</option>
                                <option value={12}>Every Month</option>
                                <option value={52}>Every Week</option>
                                <option value={365}>Every Day</option>
                            </select>
                        </div>
                        <RiHandCoinLine className="input-icons" />      
                    </div>
                </div>
                <hr style={{margin: 0}} />
                <div style={{display: "flex", gap: "0.5vw", flexDirection: "column"}}>
                    {taxes.length > 0 ? <label style={{alignSelf: "center"}}>Taxes</label> : <></>}
                    <div style={{display: "flex", gap: "1vw", flexDirection: "column"}}>
                        {taxes.length > 0 ? <div style={{display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "1vw"}}>
                            {taxes?.map((val, index) => <div key={val.taxName} className="tax-badge" title="Click to remove..."
                            onClick={() => deleteTax(index)}>
                                {`${val.taxName}: ${val.taxRate}%`}
                            </div>)}
                        </div> : <></>}
                        <div style={{display: "flex", gap: "1vw"}}>
                            <div className="user-input-container">
                                <input className="user-input" value={taxData.taxName} placeholder="Tax Name" 
                                onChange={e => setTaxData(prev => ({...prev, taxName: e.target.value.toUpperCase()}))} type="text" />
                                <TbReceipt className="input-icons" />
                            </div>
                            <div className="user-input-container">
                                <input className="user-input" type="number"  value={taxData.taxRate > 0 ? taxData.taxRate : ""} 
                                placeholder="Tax Rate" onChange={e => setTaxData(prev => ({...prev, taxRate: e.target.valueAsNumber}))} />
                                <TbReceiptTax className="input-icons" />
                            </div>
                            <button className="btn btn-outline-dark" disabled={!taxData.taxName || !taxData.taxRate} 
                            onClick={() => {loanDocument.current.taxes.push(taxData); setTaxes([...taxes, taxData]);
                                setTaxData(prev => ({...prev, taxName: "", taxRate: ""})); setResultTable(null)}}>Add</button>
                        </div>
                    </div>
                </div>
                <button className="btn btn-outline-dark" onClick={CalculatePayment} disabled={!principal || !multiplier || !interest }>Calculate Payment</button>
            </div>
            {resultTable?.length > 0 ? <div className="table-container">
                <div style={{display: "flex", gap: "1vw", alignItems: "center", fontSize: "1vw", flexDirection: "column"}}>
                <table className="table table-bordered text-center">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Payment Amount</th>
                                <th scope="col">Total Payment Amount</th>
                                <th scope="col">Total Interest</th>
                                {resultTable[0].taxes.length > 0 ? <th scope="col">Total Taxes</th> : <></>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{bodyContext.currencyFormatter(resultTable[0].paymentVal)}</td>
                                <td>{bodyContext.currencyFormatter(appContext.totalRows(resultTable, "paymentVal"))}</td>
                                <td>{bodyContext.currencyFormatter(appContext.totalRows(resultTable, "interest"))}</td>
                                {resultTable[0].taxes.length > 0 ? <td>{bodyContext.currencyFormatter((appContext.totalRows(resultTable, "paymentVal")
                                -appContext.totalRows(resultTable, "interest")-loanDocument.current.entries.principal))}</td> : <></>}
                            </tr>
                        </tbody>
                </table>
                <button className="btn btn-outline-dark" style={{width: "100%"}} onClick={() => tableRef.current.showTable()}>Payment Plan</button>
                </div>
            </div> : <></>}
            <BodyContext.Provider value={bodyContext}>
                <Table ref={tableRef} />
            </BodyContext.Provider>
        </div>
    )
}

export default Body