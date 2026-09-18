import ValidatedInput from '@kunpeng/dmn-js-shared/lib/components/ValidatedInput';

import { Component } from 'inferno';

import { getSampleDate, validateISOString, parseString } from '../Utils';

export default class OutputDateEdit extends Component {
  constructor(props, context) {
    super(props, context);

    this._translate = context.injector.get('translate');
    this._modeling = context.injector.get('modeling');

    const { element } = this.props.context;

    const parsedString = parseString(element.businessObject.text);

    this.state = {
      date: parsedString ? parsedString.date : '',
    };

    const debounceInput = context.injector.get('debounceInput');

    this.debouncedEditCell = debounceInput(this.editCell.bind(this));
    this.editCell = this.editCell.bind(this);

    this.onClick = this.onClick.bind(this);
    this.onInput = this.onInput.bind(this);
  }

  editCell(cell, text) {
    this._modeling.editCell(cell, text);
  }

  onClick() {
    const { element } = this.props.context;

    const date = getSampleDate();

    this.setState({
      date,
    });

    this.editCell(element.businessObject, `dateTime("${date}")`);
  }

  onInput({ value }) {
    const { element } = this.props.context;

    this.setState({
      date: value,
    });

    this.debouncedEditCell(element.businessObject, `dateTime("${value}")`);
  }

  render() {
    const { date } = this.state;

    return (
      <div class="context-menu-container simple-date-edit">
        <h3 class="dms-heading">{this._translate('Edit dateTime')}</h3>

        <h4 class="dms-heading">{this._translate('Set dateTime')}</h4>

        <div>
          <ValidatedInput
            className="dms-block"
            label={ this._translate('Date and time value') }
            onInput={ this.onInput }
            placeholder={ this._translate('e.g. { sample }', {
              sample: getSampleDate()
            }) }
            validate={ string => validateISOString(string) &&
              this._translate(validateISOString(string)) }
            value={ date }>
          ></ValidatedInput>

          <p className="dms-hint">
            <button className="use-today"
              onClick={ this.onClick }
              type="button">{this._translate('Use today')}</button>
          </p>
        </div>
      </div>
    );
  }
}
