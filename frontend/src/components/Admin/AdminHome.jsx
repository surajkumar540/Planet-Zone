import React from 'react'
import AdminHeader from '../Header/AdminHeader'
import ProductRow from '../Table/ProductRow'
import ProductHeading from '../Table/ProductHeading'
import AddProductButton from '../Table/AddProductButton'

const AdminHome = () => {
  return (
    <>  
        <AddProductButton/>
        <ProductHeading/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
        <ProductRow/>
    </>
  )
}

export default AdminHome