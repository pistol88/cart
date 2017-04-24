Внимание!
==========
Разработка модуля с 24.04.2017 ведется здесь: [dvizh/yii2-cart](https://github.com/dvizh/yii2-order). Рекомендую устанавливать модуль из репозиторий Dvizh, именно там находится последняя версия.

Yii2-cart
==========
Это модуль корзины для Yii2 фреймворка. Позволяет добавить в корзину любую модель, имплементирующую интерфейс pistol88\cart\interfaces\CartElement

![yii2-cart](https://cloud.githubusercontent.com/assets/8104605/15093925/aeb7a35a-14ae-11e6-96b1-72b737fa4a58.png)

Для добавления функционала заказа можно использовать этот модуль: [pistol88/yii2-order](https://github.com/pistol88/yii2-order).

Установка
---------------------------------
Выполнить команду

```
php composer require pistol88/yii2-cart "*"
```

Или добавить в composer.json

```
"pistol88/yii2-cart": "*",
```

И выполнить

```
php composer update
```

Далее, мигрируем базу:

```
php yii migrate --migrationPath=vendor/pistol88/yii2-cart/migrations
```

Подключение и настройка
---------------------------------
В конфигурационный файл приложения добавить компонент cart
```php
    'components' => [
        'cart' => [
            'class' => 'pistol88\cart\Cart',
            'currency' => 'р.', //Валюта
            'currencyPosition' => 'after', //after или before (позиция значка валюты относительно цены)
            'priceFormat' => [2,'.', ''], //Форма цены
        ],
        //...
    ]
```

И модуль (если хотите использовать виджеты)

```php
    'modules' => [
        'cart' => [
            'class' => 'pistol88\cart\Module',
        ],
        //...
    ]
```

Использование
---------------------------------
Можно добавлять в корзину элементы самостоятельно через компонент, а можно использовать готовые виджеты.
Пример эктиона, добавляющего товар в корзину:

```php
//use...
class ProductController extends Controller
{
    public function actionAddToCart($id)
    {
        //Любая модель
        $model = $this->findModel($id);
        //Кладем ее в корзину (в количестве 1, без опций)
        $cartElement = yii::$app->cart->put($model, 1, []);
    }
}
```

Положить в корзину можно любую модель, имплемементирующую интерфейс CartElement. Пример модели:

```php
//...
class Product extends ActiveRecord implements \pistol88\cart\interfaces\CartElement
{
    //..
    public function getCartId()
    {
        return $this->id;
    }
    
    public function getCartName()
    {
        return $this->name;
    }
    
    public function getCartPrice()
    {
        return $this->price;
    }
    
    //Опции продукта для выбора при добавлении в корзину
    public function getCartOptions()
    {
        return [
            '1' => [
                'name' => 'Цвет',
                'variants' => ['1' => 'Красный', '2' => 'Белый', '3' => 'Синий'],
            ],
            '2' => [
                'name' => 'Размер',
                'variants' => ['4' => 'XL', '5' => 'XS', '6' => 'XXL'],
            ]
        ];
    }
    //..
}
```

Получить элементы корзины:
```php
//...
$elements = yii::$app->cart->elements;
```

Виджеты
==========
В состав модуля входит несколько виджетов. Все работают аяксом.

```php
<?php
use pistol88\cart\widgets\BuyButton;
use pistol88\cart\widgets\TruncateButton;
use pistol88\cart\widgets\CartInformer;
use pistol88\cart\widgets\ElementsList;
use pistol88\cart\widgets\DeleteButton;
use pistol88\cart\widgets\ChangeCount;
use pistol88\cart\widgets\ChangeOptions;
?>

<?php /* Выведет кнопку покупки */ ?>
<?= BuyButton::widget([
	'model' => $model,
	'text' => 'Заказать',
	'htmlTag' => 'a',
	'cssClass' => 'custom_class'
]) ?>

<?php /* Выведет количество товаров и сумму заказа */ ?>
<?= CartInformer::widget(['htmlTag' => 'a', 'offerUrl' => '/?r=cart', 'text' => '{c} на {p}']); ?>

<?php /* Выведет кнопку очистки корзины */ ?>
<?= TruncateButton::widget(); ?>

<?php
/*
Выведет корзину с выпадающими или обычными ('type' => ElementsList::TYPE_FULL) элементами списка.
Можно передать перечень дополнительных полей через otherFields (['Остаток' => 'amount']).
*/
?>
<?=ElementsList::widget(['type' => ElementsList::TYPE_DROPDOWN]);?>

<?php /* Выведет кнопку удаления элемента */ ?>
<?=DeleteButton::widget(['model' => $item]);?>

<?php
/*
Виджеты ниже позволят выбрать кол-во или опции элемента.
Можно передать как модель элемента корзины, так и сам продукт,
когда он еще не стал элементом.
*/ ?>
<?=ChangeCount::widget(['model' => $item]);?>
<?php /* У ChangeOptions можно изменить вид ('type' => ChangeOptions::TYPE_RADIO) */ ?>
<?=ChangeOptions::widget(['model' => $item]);?>
```

Скидки
==========
Скидки реализуются через поведение и(или) событие. Корзине можно присвоить любое поведение (в конфиге):

```php
        'cart' => [
            'class' => 'pistol88\cart\Cart',
            //...
            'as discount' => [
                'class' => 'pistol88\cart\behaviors\Discount',
                'percent' => 50,
            ],
        ],
```

Поведение цепляется к событию EVENT_CART_COST и задает скидку (см. pistol88\cart\behaviors\Discount).

Можно подцепиться напрямую к событию:

```php
        'cart' => [
            'class' => 'pistol88\cart\Cart',
            //...
            'on cart_cost' => function($event) {
                $event->cost = ($event->cost*50)/100;
            }
        ],

```

События
==========

Все события корзины:

 * EVENT_CART_COST - изменение общей цены
 * EVENT_CART_COUNT - изменение количества
 * EVENT_CART_TRUNCATE - очищение корзины
 * EVENT_CART_PUT - добавление элемента
 * EVENT_ELEMENT_COST  - изменение цены элемента
 * EVENT_ELEMENT_ROUNDING - округление цены элемента
