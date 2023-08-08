const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  Category.findAll({
    include: {
      model: Product,
      attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
    }
  })
    .then(categories => {
      if(!categories) {
        res.status(404).json({message: 'No categories found! Have you seeded your db?'});
        return;
      }
      res.json(categories);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err)
    });
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  Category.findOne({
    where: {
      id: req.params.id
    },
    include: {
      model: Product,
      attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
    }
  })
    .then(categories => {
      if(!categories) {
        res.status(404).json({message: 'No categories found! Have you seeded your db?'});
        return;
      }
      res.json(categories);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err)
    });
});

router.post('/', (req, res) => {
  // create a new category
  Category.create({
    category_name: req.body.category_name
  })
    .then(categories => res.json(categories))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id
    }
  })
  .then(categories => {
    if (!categories) {
      res.status(404).json({message: "No category matches this ID. Have you seeded your db?"});
      return;
    }
    res.json(categories)
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  })
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(categories => {
      if (!categories){
        res.status(404).json({message: 'No category matches this ID. Have you seeded your db?'});
        return;
      }
      res.json(categories);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
