'use strict'

const { StatusCodes } = require('http-status-codes')
const productRepo = require('~/api/v1/repositories/product.repo')
const checkoutRepo = require('~/api/v1/repositories/checkout.repo')
const orderStatusRepo = require('~/api/v1/repositories/order.status.repo')
const orderRepo = require('~/api/v1/repositories/order.repo')
const orderDetailRepo = require('~/api/v1/repositories/order.detail.repo')
const ApiError = require('~/core/api.error')

const review = async ({ orderProducts = [] }) => {
  const checkedProducts = await checkoutRepo.checkProductsAvailable(orderProducts)
  if (checkedProducts.includes(undefined)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Order wrong')

  const totalOrder = checkedProducts.reduce((acc, orderProduct) => {
    return acc + orderProduct.price * orderProduct.quantity
  }, 0)

  const fullOrderProducts = await checkoutRepo.getfullOrderProductsByIds(orderProducts)
  if (fullOrderProducts.includes(undefined)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Order wrong')

  return {
    products:  fullOrderProducts,
    totalOrder
  }
}

const order = async ({ userId, shipAddress, phoneNumber, paymentFormId, orderProducts = [] }) => {
  const checkedProducts = await checkoutRepo.checkProductsAvailable(orderProducts)
  if (checkedProducts.includes(undefined)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Order wrong')

  try {
    const newOrder = await orderRepo.createOrder({
      shipAddress,
      phoneNumber,
      userId,
      paymentFormId,
      orderStatusId: 1
    })

    const fullOrderProducts = await Promise.all(orderProducts.map(async (orderProduct) => {
      const foundProduct = await productRepo.getProductById(orderProduct.productId)
      if (!foundProduct) throw new ApiError(StatusCodes.BAD_REQUEST, 'Order wrong')

      const newOrderDetail = await orderDetailRepo.createOrderDetail({
        orderId: newOrder.id,
        productId: orderProduct.productId,
        quantity: orderProduct.quantity,
        price: foundProduct.price
      })

      // reduce inventory when ordering
      foundProduct.update({ stockQuantity: foundProduct.stockQuantity - orderProduct.quantity })

      return {
        quantity: newOrderDetail.quantity,
        product: {
          id: foundProduct.id,
          name: foundProduct.name,
          description: foundProduct.description,
          imageUrl: foundProduct.imageUrl,
          price: foundProduct.price
        }
      }
    }))

    const foundOrderStatus = await orderStatusRepo.getOrderStatusById(newOrder.orderStatusId)

    return {
      orderId: newOrder.id,
      shipAddress: newOrder.shipAddress,
      phoneNumber: newOrder.phoneNumber,
      orderStatus: foundOrderStatus.name,
      products: fullOrderProducts
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message)
  }
}

const getAllOrders = async ({ userId, orderStatusName, paymentFormName }) => {
  return await orderRepo.getAllOrders({ userId, orderStatusName, paymentFormName })
}

module.exports = {
  review,
  order,
  getAllOrders
}