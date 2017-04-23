<?php

use yii\helpers\Html;
use pistol88\cart\widgets\ChangeCount;
use pistol88\cart\widgets\DeleteButton;
use pistol88\cart\widgets\ElementPrice;
use pistol88\cart\widgets\ElementCost;

?>
<li class="pistol88-cart-row ">
    <div class=" row">
        <div class="col-xs-8">
            <?= $name ?>

            <?php if ($options) {
                $productOptions = '';
                foreach ($options as $optionId => $valueId) {
                    if ($optionData = $allOptions[$optionId]) {
                        $option = $optionData['name'];
                        $value = $optionData['variants'][$valueId];
                        $productOptions .= Html::tag('div', Html::tag('strong', $option) . ':' . $value);
                    }
                }
                echo Html::tag('div', $productOptions, ['class' => 'pistol88-cart-show-options']);
            } ?>

            <?php if(!empty($otherFields)) {
                foreach($otherFields as $fieldName => $field) {
                    if(isset($product->$field)) echo Html::tag('p', Html::tag('small', $fieldName.': '.$product->$field));
                }
            } ?>
        </div>
        <div class="col-xs-3">
            <?= ElementPrice::widget(['model' => $model]); ?>
            <?= ChangeCount::widget([
                'model' => $model,
                'showArrows' => $showCountArrows,
                'actionUpdateUrl' => $controllerActions['update'],
            ]); ?>
            <?= ElementCost::widget(['model' => $model]); ?>
        </div>

        <?= Html::tag('div', DeleteButton::widget([
            'model' => $model,
            'deleteElementUrl' => $controllerActions['delete'],
            'lineSelector' => 'pistol88-cart-row ',
            'cssClass' => 'delete']),
            ['class' => 'shop-cart-delete col-xs-1']);
        ?>
    </div>
</li>
