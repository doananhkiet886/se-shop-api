'use strict'

const { StatusCodes, ReasonPhrases } = require('http-status-codes')
const categoryService = require('~/api/v1/services/category.service')
const SuccessResponse = require('~/core/success.response')
const asyncHandling = require('~/core/async.handling')

const createCategory = asyncHandling(async (req, res) => {
  const { name, description } = req.body

  const category = await categoryService.createCategory({ name, description })

  new SuccessResponse({
    statusCode: StatusCodes.CREATED,
    message: 'Create category successfully',
    metadata: { category }
  }).send(res)
})

const getAllCategories = asyncHandling(async (req, res) => {
  const { filter, selector, pagination, sorter } = req

  const categories = await categoryService.getAllCategories({ filter, selector, pagination, sorter })

  new SuccessResponse({
    message: 'Get all categories successfully',
    metadata: { categories }
  }).send(res)
})

const getProductsByCategoryId = asyncHandling(async (req, res) => {
  const id = Number(req.params.id)
  const { filter, selector, pagination, sorter } = req

  const products = await categoryService.getProductsByCategoryId({ categoryId: id, filter, selector, pagination, sorter })

  new SuccessResponse({
    message: 'Get products by category id successfully',
    metadata: { products }
  }).send(res)
})

const getCategoryById = asyncHandling(async (req, res) => {
  const { id } = req.params

  const category = await categoryService.getCategoryById({ id })

  new SuccessResponse({
    message: 'Get category successfully',
    metadata: { category }
  }).send(res)
})

const updateCategoryById = asyncHandling( async (req, res) => {
  const id = Number(req.params.id)
  const { name, description } = req.body

  const category = await categoryService.updateCategoryById({ id, name, description })

  new SuccessResponse({
    message: 'Update category successfully',
    metadata: { category }
  }).send(res)
})

const deleteCategoryById = asyncHandling(async (req, res) => {
  const { id } = Number(req.params.id)

  const categories = await categoryService.deleteCategoryById({ id })

  new SuccessResponse({
    message: 'Delete category successfully',
    metadata: { categories }
  }).send(res)
})

const deleteCategoryByIds = asyncHandling(async (req, res) => {
  const { ids } = req.body

  const categories = await categoryService.deleteCategoryByIds({ ids })

  new SuccessResponse({
    message: 'Delete some categories successfully',
    metadata: { categories }
  }).send(res)
})

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  deleteCategoryByIds,
  getProductsByCategoryId
}