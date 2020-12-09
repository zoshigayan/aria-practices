const { ariaTest } = require('..');
const { By, Key } = require('selenium-webdriver');
const assertAttributeValues = require('../util/assertAttributeValues');
const assertAriaLabelExists = require('../util/assertAriaLabelExists');
const assertAriaLabelledby = require('../util/assertAriaLabelledby');
const assertAriaRoles = require('../util/assertAriaRoles');

const exampleFile = 'slider/slider-color-viewer-mobile.html';

const ex = {
  groupSelector: '#ex1 [role="group"]',
  sliderSelector: '#ex1 [role="slider"]',
  buttonSelector: '#ex1 .change',
  buttonSVGSelector: '#ex1 .change svg',
  redButtonSelectors: [
    '#ex1 .red .dec10',
    '#ex1 .red .dec',
    '#ex1 .red .inc',
    '#ex1 .red .inc10',
  ],
  greenButtonSelectors: [
    '#ex1 .green .dec10',
    '#ex1 .green .dec',
    '#ex1 .green .inc',
    '#ex1 .green .inc10',
  ],
  blueButtonSelectors: [
    '#ex1 .blue .dec10',
    '#ex1 .blue .dec',
    '#ex1 .blue .inc',
    '#ex1 .blue .inc10',
  ],
  hexTextInput: '#ex1 .color-info .color-value-hex',
  rgbTextInput: '#ex1 .color-info .color-value-rgb',
  colorBox: '#ex1 .color-info .color-box',
};

const testDisplayMatchesValue = async function (t, rgbString) {
  const rgbValue = await t.context.session
    .findElement(By.css(ex.rgbTextInput))
    .getAttribute('value');
  const hexValue = await t.context.session
    .findElement(By.css(ex.hexTextInput))
    .getAttribute('value');
  const boxColor = await t.context.session
    .findElement(By.css(ex.colorBox))
    .getCssValue('background-color');

  if (rgbValue !== rgbString) {
    return (
      ex.rgbTextInput +
      ' was not update, value is ' +
      rgbValue +
      ' but expected ' +
      rgbString
    );
  }

  if (boxColor !== 'rgb(' + rgbString + ')') {
    return (
      'Box color was not update, background-color is ' +
      boxColor +
      ' but expected ' +
      'rgb(' +
      rgbString +
      ')'
    );
  }

  const rbgFromHexString = hexValue
    .match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    .slice(1, 4)
    .map((x) => parseInt(x, 16))
    .join(', ');

  if (rbgFromHexString !== rgbString) {
    return (
      ex.hexTextInput +
      ' was not update, value is ' +
      rbgFromHexString +
      ' but expected ' +
      rgbString
    );
  }

  return true;
};

const sendAllSlidersToEnd = async function (t) {
  const sliders = await t.context.queryElements(t, ex.sliderSelector);

  for (let slider of sliders) {
    await slider.sendKeys(Key.END);
  }
};

const sendAllSlidersToBeginning = async function (t) {
  const sliders = await t.context.queryElements(t, ex.sliderSelector);

  for (let slider of sliders) {
    await slider.sendKeys(Key.HOME);
  }
};

// Attributes

ariaTest(
  'role="group" on div element',
  exampleFile,
  'group-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'group', '1', 'div');
  }
);

ariaTest(
  '"aria-labelledby" set on group',
  exampleFile,
  'aria-labelledby',
  async (t) => {
    await assertAriaLabelledby(t, ex.groupSelector);
  }
);

ariaTest(
  'role="slider" on div element',
  exampleFile,
  'slider-role',
  async (t) => {
    await assertAriaRoles(t, 'ex1', 'slider', '3', 'div');
  }
);

ariaTest(
  '"tabindex" set to "0" on sliders',
  exampleFile,
  'tabindex',
  async (t) => {
    await assertAttributeValues(t, ex.sliderSelector, 'tabindex', '0');
  }
);

ariaTest(
  '"aria-valuemax" set to "255" on sliders',
  exampleFile,
  'aria-valuemax',
  async (t) => {
    await assertAttributeValues(t, ex.sliderSelector, 'aria-valuemax', '255');
  }
);

ariaTest(
  '"aria-valuemin" set to "0" on sliders',
  exampleFile,
  'aria-valuemin',
  async (t) => {
    await assertAttributeValues(t, ex.sliderSelector, 'aria-valuemin', '0');
  }
);

ariaTest(
  '"aria-valuenow" reflects slider value',
  exampleFile,
  'aria-valuenow',
  async (t) => {
    await assertAttributeValues(t, ex.sliderSelector, 'aria-valuenow', '128');
  }
);

ariaTest(
  '"aria-labelledby" set on sliders',
  exampleFile,
  'aria-labelledby',
  async (t) => {
    await assertAriaLabelledby(t, ex.sliderSelector);
  }
);

ariaTest(
  '"tabindex" set to "-1" on buttons',
  exampleFile,
  'button-tabindex',
  async (t) => {
    await assertAttributeValues(t, ex.buttonSelector, 'tabindex', '-1');
  }
);

ariaTest(
  'Test aria-label on buttons',
  exampleFile,
  'button-aria-label',
  async (t) => {
    await assertAriaLabelExists(t, ex.buttonSelector);
  }
);

ariaTest(
  '"focusable" set to "false" on svg image in buttons',
  exampleFile,
  'button-svg-focusable',
  async (t) => {
    await assertAttributeValues(t, ex.buttonSVGSelector, 'focusable', 'false');
  }
);

// Keys

ariaTest(
  'Right arrow increases slider value by 1',
  exampleFile,
  'key-right-arrow',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.ARROW_RIGHT);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow right key to the red slider, the value of the red slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '129, 128, 128'),
      'Display should match rgb(129, 128, 128)'
    );

    // Send more than 255 keys to red slider
    for (let i = 0; i < 260; i++) {
      await redSlider.sendKeys(Key.ARROW_RIGHT);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow right key, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 128, 128'),
      'Display should match rgb(255, 128, 128)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.ARROW_RIGHT);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow right key to the green slider, the value of the green slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 129, 128'),
      'Display should match rgb(255, 129, 128)'
    );

    // Send more than 255 keys to green slider
    for (let i = 0; i < 260; i++) {
      await greenSlider.sendKeys(Key.ARROW_RIGHT);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow right key, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 128'),
      'Display should match rgb(255, 255, 128)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.ARROW_RIGHT);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow right key to the blue slider, the value of the blue slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 129'),
      'Display should match rgb(255, 255, 129)'
    );

    // Send more than 255 keys to blue slider
    for (let i = 0; i < 260; i++) {
      await blueSlider.sendKeys(Key.ARROW_RIGHT);
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow right key, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

ariaTest(
  'up arrow increases slider value by 1',
  exampleFile,
  'key-up-arrow',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.ARROW_UP);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow up key to the red slider, the value of the red slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '129, 128, 128'),
      'Display should match rgb(129, 128, 128)'
    );

    // Sen over 255 arrow up keys to the red slider
    for (let i = 0; i < 260; i++) {
      await redSlider.sendKeys(Key.ARROW_UP);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow up key, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 128, 128'),
      'Display should match rgb(255, 128, 128)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.ARROW_UP);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow up key to the blue slider, the value of the green slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 129, 128'),
      'Display should match rgb(255, 129, 128)'
    );

    // Send more than 255 keys to green slider
    for (let i = 0; i < 260; i++) {
      await greenSlider.sendKeys(Key.ARROW_UP);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow up key, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 128'),
      'Display should match rgb(255, 255, 128)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.ARROW_UP);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 arrow up key to the blue slider, the value of the blue slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 129'),
      'Display should match rgb(255, 255, 129)'
    );

    // Send more than 255 keys to blue slider
    for (let i = 0; i < 260; i++) {
      await blueSlider.sendKeys(Key.ARROW_UP);
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 arrow up key, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

ariaTest(
  'page up increases slider value by 10',
  exampleFile,
  'key-page-up',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.PAGE_UP);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '138',
      'After sending 1 page up key to the red slider, the value of the red slider should be 138'
    );
    t.true(
      await testDisplayMatchesValue(t, '138, 128, 128'),
      'Display should match rgb(138, 128, 128)'
    );

    // Send over 26 page up keys to the red slider
    for (let i = 0; i < 26; i++) {
      await redSlider.sendKeys(Key.PAGE_UP);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 26 page up key, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 128, 128'),
      'Display should match rgb(255, 128, 128)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.PAGE_UP);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '138',
      'After sending 1 page up key to the blue slider, the value of the green slider should be 138'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 138, 128'),
      'Display should match rgb(255, 138, 128)'
    );

    // Send more than 26 keys to green slider
    for (let i = 0; i < 26; i++) {
      await greenSlider.sendKeys(Key.PAGE_UP);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 260 page up key, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 128'),
      'Display should match rgb(255, 255, 128)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.PAGE_UP);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '138',
      'After sending 1 page up key to the blue slider, the value of the blue slider should be 138'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 138'),
      'Display should match rgb(255, 255, 138)'
    );

    // Send more than 26 keys to blue slider
    for (let i = 0; i < 26; i++) {
      await blueSlider.sendKeys(Key.PAGE_UP);
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 26 page up key, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

ariaTest(
  'key end set slider at max value',
  exampleFile,
  'key-end',
  async (t) => {
    sendAllSlidersToBeginning(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send key end to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.END);

    t.is(
      await await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 1 end key to the red slider, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 0, 0'),
      'Display should match rgb(255, 0, 0)'
    );

    // Send key end to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.END);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 1 end key to the blue slider, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 0'),
      'Display should match rgb(255, 255, 0)'
    );

    // Send key end to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.END);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 1 end key to the blue slider, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

ariaTest(
  'left arrow decreases slider value by 1',
  exampleFile,
  'key-left-arrow',
  async (t) => {
    await sendAllSlidersToEnd(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.ARROW_LEFT);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow left key to the red slider, the value of the red slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '254, 255, 255'),
      'Display should match rgb(254, 255, 255)'
    );

    // Send more than 255 keys to red slider
    for (let i = 0; i < 260; i++) {
      await redSlider.sendKeys(Key.ARROW_LEFT);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow left key, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 255, 255'),
      'Display should match rgb(0, 255, 255)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.ARROW_LEFT);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow left key to the blue slider, the value of the green slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 254, 255'),
      'Display should match rgb(0, 254, 255)'
    );

    // Send more than 255 keys to green slider
    for (let i = 0; i < 260; i++) {
      await greenSlider.sendKeys(Key.ARROW_LEFT);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow left key, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 255'),
      'Display should match rgb(0, 0, 255)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.ARROW_LEFT);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow left key to the blue slider, the value of the blue slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 254'),
      'Display should match rgb(0, 0, 254)'
    );

    // Send more than 255 keys to blue slider
    for (let i = 0; i < 260; i++) {
      await blueSlider.sendKeys(Key.ARROW_LEFT);
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow left key, the value of the blue slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );
  }
);

ariaTest(
  'down arrow decreases slider value by 1',
  exampleFile,
  'key-down-arrow',
  async (t) => {
    await sendAllSlidersToEnd(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.ARROW_DOWN);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow down key to the red slider, the value of the red slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '254, 255, 255'),
      'Display should match rgb(254, 255, 255)'
    );

    // Send more than 255 keys to red slider
    for (let i = 0; i < 260; i++) {
      await redSlider.sendKeys(Key.ARROW_DOWN);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow down key, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 255, 255'),
      'Display should match rgb(0, 255, 255)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.ARROW_DOWN);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow down key to the blue slider, the value of the green slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 254, 255'),
      'Display should match rgb(0, 254, 255)'
    );

    // Send more than 255 keys to green slider
    for (let i = 0; i < 260; i++) {
      await greenSlider.sendKeys(Key.ARROW_DOWN);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow down key, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 255'),
      'Display should match rgb(0, 0, 255)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.ARROW_DOWN);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 arrow down key to the blue slider, the value of the blue slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 254'),
      'Display should match rgb(0, 0, 254)'
    );

    // Send more than 255 keys to blue slider
    for (let i = 0; i < 260; i++) {
      await blueSlider.sendKeys(Key.ARROW_DOWN);
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 260 arrow down key, the value of the blue slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );
  }
);

ariaTest(
  'page down decreases slider value by 10',
  exampleFile,
  'key-page-down',
  async (t) => {
    await sendAllSlidersToEnd(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    // Send 1 key to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.PAGE_DOWN);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '245',
      'After sending 1 page down key to the red slider, the value of the red slider should be 245'
    );
    t.true(
      await testDisplayMatchesValue(t, '245, 255, 255'),
      'Display should match rgb(245, 255, 255)'
    );

    // Send more than 25 keys to red slider
    for (let i = 0; i < 26; i++) {
      await redSlider.sendKeys(Key.PAGE_DOWN);
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 26 page down key, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 255, 255'),
      'Display should match rgb(0, 255, 255)'
    );

    // Send 1 key to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.PAGE_DOWN);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '245',
      'After sending 1 page down key to the blue slider, the value of the green slider should be 245'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 245, 255'),
      'Display should match rgb(0, 245, 255)'
    );

    // Send more than 25 keys to green slider
    for (let i = 0; i < 26; i++) {
      await greenSlider.sendKeys(Key.PAGE_DOWN);
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 26 page down key, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 255'),
      'Display should match rgb(0, 0, 255)'
    );

    // Send 1 key to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.PAGE_DOWN);
  }
);

// Test decrease by 10 buttons
ariaTest(
  'decrease 10 button changes slider value by 10',
  exampleFile,
  'button-space-enter',
  async (t) => {
    await sendAllSlidersToEnd(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);
    const redDec10Button = await t.context.queryElement(
      t,
      ex.redButtonSelectors[0]
    );
    const greenDec10Button = await t.context.queryElement(
      t,
      ex.greenButtonSelectors[0]
    );
    const blueDec10Button = await t.context.queryElement(
      t,
      ex.blueButtonSelectors[0]
    );

    // Click on the red dec 10 button
    const redSlider = sliders[0];
    await redDec10Button.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '245',
      'After clicking on dec 10 button, the value of the red slider should be 245'
    );
    t.true(
      await testDisplayMatchesValue(t, '245, 255, 255'),
      'Display should match rgb(245, 255, 255)'
    );

    // Send more than 25 clicks to red dec 10 button
    for (let i = 0; i < 26; i++) {
      await redDec10Button.click();
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 26 clicks, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 255, 255'),
      'Display should match rgb(0, 255, 255)'
    );

    // Send 1 click to green dec 10 button
    const greenSlider = sliders[1];
    await greenDec10Button.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '245',
      'After sending 1 click to the blue dec 10 button, the value of the green slider should be 245'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 245, 255'),
      'Display should match rgb(0, 245, 255)'
    );

    // Send more than 25 click to green dec 10 button
    for (let i = 0; i < 26; i++) {
      await greenDec10Button.click();
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 26 clicks, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 255'),
      'Display should match rgb(0, 0, 255)'
    );

    // Click on the red dec 10 button
    const blueSlider = sliders[2];
    await blueDec10Button.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '245',
      'After clicking on dec 10 button, the value of the blue slider should be 245'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 245'),
      'Display should match rgb(0, 0, 245)'
    );

    // Send more than 25 clicks to blue dec 10 button
    for (let i = 0; i < 26; i++) {
      await blueDec10Button.click();
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 26 clicks, the value of the blue slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );
  }
);

// Test decrease by one buttons
ariaTest(
  'decrease by one button changes slider value by 1',
  exampleFile,
  'button-space-enter',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);
    const redDecButton = await t.context.queryElement(
      t,
      ex.redButtonSelectors[1]
    );
    const greenDecButton = await t.context.queryElement(
      t,
      ex.greenButtonSelectors[1]
    );
    const blueDecButton = await t.context.queryElement(
      t,
      ex.blueButtonSelectors[1]
    );

    // Click on the red dec one button
    const redSlider = sliders[0];
    await redDecButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '127',
      'After clicking on dec one button, the value of the red slider should be 127'
    );
    t.true(
      await testDisplayMatchesValue(t, '127, 128, 128'),
      'Display should match rgb(127, 128, 128)'
    );

    // Send 1 click to green dec one button
    const greenSlider = sliders[1];
    await greenDecButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '127',
      'After sending 1 click to the blue dec one button, the value of the green slider should be 127'
    );
    t.true(
      await testDisplayMatchesValue(t, '127, 127, 128'),
      'Display should match rgb(127, 127, 128)'
    );

    // Click on the red dec one button
    const blueSlider = sliders[2];
    await blueDecButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '127',
      'After clicking on dec one button, the value of the blue slider should be 127'
    );
    t.true(
      await testDisplayMatchesValue(t, '127, 127, 127'),
      'Display should match rgb(127, 127, 127)'
    );

    await sendAllSlidersToEnd(t);

    // Click on the red dec one button
    await redDecButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '254',
      'After clicking on dec one button, the value of the red slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '254, 255, 255'),
      'Display should match rgb(254, 255, 255)'
    );

    // Send 1 click to green dec one button
    await greenDecButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '254',
      'After sending 1 click to the blue dec one button, the value of the green slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '254, 254, 255'),
      'Display should match rgb(254, 254, 255)'
    );

    // Click on the red dec one button
    await blueDecButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '254',
      'After clicking on dec one button, the value of the blue slider should be 254'
    );
    t.true(
      await testDisplayMatchesValue(t, '254, 254, 254'),
      'Display should match rgb(254, 254, 254)'
    );

    await sendAllSlidersToBeginning(t);

    // Click on the red dec one button
    await redDecButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After clicking on dec one button, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );

    // Send 1 click to green dec one button
    await greenDecButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 1 click to the blue dec one button, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );

    // Click on the red dec one button
    await blueDecButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '0',
      'After clicking on dec one button, the value of the blue slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );
  }
);

// Test increase by one buttons
ariaTest(
  'increase by one button changes slider value by 1',
  exampleFile,
  'button-space-enter',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);
    const redIncButton = await t.context.queryElement(
      t,
      ex.redButtonSelectors[2]
    );
    const greenIncButton = await t.context.queryElement(
      t,
      ex.greenButtonSelectors[2]
    );
    const blueIncButton = await t.context.queryElement(
      t,
      ex.blueButtonSelectors[2]
    );

    // Click on the red inc one button
    const redSlider = sliders[0];
    await redIncButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '129',
      'After clicking on inc one button, the value of the red slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '129, 128, 128'),
      'Display should match rgb(129, 128, 128)'
    );

    // Send 1 click to green inc one button
    const greenSlider = sliders[1];
    await greenIncButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '129',
      'After sending 1 click to the blue inc one button, the value of the green slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '129, 129, 128'),
      'Display should match rgb(129, 129, 128)'
    );

    // Click on the red inc one button
    const blueSlider = sliders[2];
    await blueIncButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '129',
      'After clicking on inc one button, the value of the blue slider should be 129'
    );
    t.true(
      await testDisplayMatchesValue(t, '129, 129, 129'),
      'Display should match rgb(129, 129, 129)'
    );

    await sendAllSlidersToBeginning(t);

    // Click on the red inc one button
    await redIncButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '1',
      'After clicking on inc one button, the value of the red slider should be 1'
    );
    t.true(
      await testDisplayMatchesValue(t, '1, 0, 0'),
      'Display should match rgb(1, 0, 0)'
    );

    // Send 1 click to green dec one button
    await greenIncButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '1',
      'After sending 1 click to the blue inc one button, the value of the green slider should be 1'
    );
    t.true(
      await testDisplayMatchesValue(t, '1, 1, 0'),
      'Display should match rgb(1, 1, 0)'
    );

    // Click on the red dec 10 button
    await blueIncButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '1',
      'After clicking on inc one button, the value of the blue slider should be 1'
    );
    t.true(
      await testDisplayMatchesValue(t, '1, 1, 1'),
      'Display should match rgb(1, 1, 1)'
    );

    await sendAllSlidersToEnd(t);

    // Click on the red inc one button
    await redIncButton.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After clicking on inc one button, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );

    // Send 1 click to green dec one button
    await greenIncButton.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 1 click to the blue inc one button, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );

    // Click on the red dec 10 button
    await blueIncButton.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After clicking on inc one button, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

// Test increase by 10 buttons
ariaTest(
  'increase 10 button changes slider value by 10',
  exampleFile,
  'button-space-enter',
  async (t) => {
    await sendAllSlidersToBeginning(t);

    const sliders = await t.context.queryElements(t, ex.sliderSelector);
    const redInc10Button = await t.context.queryElement(
      t,
      ex.redButtonSelectors[3]
    );
    const greenInc10Button = await t.context.queryElement(
      t,
      ex.greenButtonSelectors[3]
    );
    const blueInc10Button = await t.context.queryElement(
      t,
      ex.blueButtonSelectors[3]
    );

    // Click on the red dec 10 button
    const redSlider = sliders[0];
    await redInc10Button.click();

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '10',
      'After clicking on inc 10 button, the value of the red slider should be 10'
    );
    t.true(
      await testDisplayMatchesValue(t, '10, 0, 0'),
      'Display should match rgb(10, 0, 0)'
    );

    // Send more than 25 clicks to red inc 10 button
    for (let i = 0; i < 26; i++) {
      await redInc10Button.click();
    }

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 26 clicks, the value of the red slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 0, 0'),
      'Display should match rgb(255, 0, 0)'
    );

    // Send 1 click to green inc 10 button
    const greenSlider = sliders[1];
    await greenInc10Button.click();

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '10',
      'After sending 1 click to the blue inc 10 button, the value of the green slider should be 10'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 10, 0'),
      'Display should match rgb(255, 10, 0)'
    );

    // Send more than 25 click to green inc 10 button
    for (let i = 0; i < 26; i++) {
      await greenInc10Button.click();
    }

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 26 clicks, the value of the green slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 0'),
      'Display should match rgb(255, 255, 0)'
    );

    // Click on the red inc 10 button
    const blueSlider = sliders[2];
    await blueInc10Button.click();

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '10',
      'After clicking on inc 10 button, the value of the blue slider should be 10'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 10'),
      'Display should match rgb(255, 255, 10)'
    );

    // Send more than 25 clicks to blue dec 10 button
    for (let i = 0; i < 26; i++) {
      await blueInc10Button.click();
    }

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '255',
      'After sending 26 clicks, the value of the blue slider should be 255'
    );
    t.true(
      await testDisplayMatchesValue(t, '255, 255, 255'),
      'Display should match rgb(255, 255, 255)'
    );
  }
);

ariaTest(
  'home set slider value to minimum',
  exampleFile,
  'key-home',
  async (t) => {
    const sliders = await t.context.queryElements(t, ex.sliderSelector);

    await sendAllSlidersToEnd(t);

    // Send key end to red slider
    const redSlider = sliders[0];
    await redSlider.sendKeys(Key.HOME);

    t.is(
      await redSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 1 home key to the red slider, the value of the red slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 255, 255'),
      'Display should match rgb(0, 255, 255)'
    );

    // Send key home to green slider
    const greenSlider = sliders[1];
    await greenSlider.sendKeys(Key.HOME);

    t.is(
      await greenSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 1 home key to the blue slider, the value of the green slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 255'),
      'Display should match rgb(0, 0, 255)'
    );

    // Send key home to blue slider
    const blueSlider = sliders[2];
    await blueSlider.sendKeys(Key.HOME);

    t.is(
      await blueSlider.getAttribute('aria-valuenow'),
      '0',
      'After sending 1 home key to the blue slider, the value of the blue slider should be 0'
    );
    t.true(
      await testDisplayMatchesValue(t, '0, 0, 0'),
      'Display should match rgb(0, 0, 0)'
    );
  }
);
