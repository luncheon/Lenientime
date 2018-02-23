(function () {
  var timeStrings = [
    '1',
    '-1',
    'now',
    '1am',
    '1pm',
    '13am',
    '13pm',
    '12',
    '12am',
    '12pm',
    '24',
    '123',
    '123pm',
    '1234',
    '12345',
    '123456',
    '123456am',
    '1234567',
    '12345678',
    '123456789',
    '12345678901234',
    '1.25',
    '25.5',
    '123.5',
    ':',
    '::',
    ':::',
    '1:',
    '12:',
    '123:',
    '-1:',
    '123.5:',
    ':1',
    ':12',
    ':123',
    ':-1',
    ':.25',
    ':1:',
    '::1',
    '::12',
    '::123',
    '::-1',
    '::-.124',
    '1:2',
    ':1:2',
    '1::2',
    '1:2:3',
    '２：３４　ｐＭ',
    'not a time string',
  ];

  var formats = [
    'HH:mm:ss.SSS',
    '_h\\h _m\\m _s.S\\s a',
    'k:m:s.SS AA'
  ];

  document.querySelector('.format-examples').appendChild(createElement('table', undefined, [
    createElement('thead', undefined, [
      createElement('tr', undefined, [
        createElement('th', undefined, ''),
        createElement('th', undefined, 'format'),
      ]),
      createElement('tr', undefined, [
        createElement('th', undefined, 'input'),
        createElement('th', undefined, formats.map(function (format, index) {
          return createElement('input', { 'class': 'format', value: format }, undefined, {
            input: function () {
              var format = formats[index] = this.value;
              var rows = this.closest('table').tBodies[0].rows;
              for (var i = 0, len = rows.length; i < len; i++) {
                var row = rows[i];
                var timeString = row.querySelector('.input').value;
                row.querySelector('.formatted:nth-child(' + (index + 1) + ')').value = lenientime(timeString).format(format);
              }
            },
          });
        })),
      ]),
    ]),
    createElement('tbody', undefined, timeStrings.map(function (timeString) {
      return createElement('tr', undefined, [
        createElement('td', undefined, [
          createElement(
            'input',
            { 'class': 'input', value: timeString },
            undefined,
            {
              input: function () {
                var timeString = this.value;
                this.closest('tr').querySelectorAll('.formatted').forEach(function (formatted, index) {
                  formatted.value = lenientime(timeString).format(formats[index]);
                });
              },
            }
          ),
        ]),
        createElement('td', undefined, formats.map(function (format) {
          return createElement(
            'input',
            { 'class': 'formatted', value: lenientime(timeString).format(format), tabIndex: -1 },
            undefined,
            { keypress: function (event) { event.preventDefault(); } }  // for readonly; "readonly" attribute hides the caret I need.
          );
        })),
      ]);
    })),
  ]))

  function createElement(tagName, attributes, children, eventListeners) {
    var element = document.createElement(tagName);
    attributes && Object.keys(attributes).forEach(function (name) { element.setAttribute(name, attributes[name]) });
    if (children) {
      if (typeof children === 'string') {
        element.textContent = children;
      } else {
        children.forEach(function (child) { element.appendChild(child) });
      }
    }
    eventListeners && Object.keys(eventListeners).forEach(function (event) { element.addEventListener(event, eventListeners[event]) });
    return element;
  }
})();
