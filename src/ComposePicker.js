import React, { Component } from 'react';
import { View, TouchableHighlight, Modal, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';
import DateRange from './DateRange';
import moment from 'moment';
import normalize from './normalizeText';

const styles = {
  placeholderText: {
    color: '#c9c9c9',
    fontSize: normalize(18)
  },
  contentInput: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentText: {
    fontSize: normalize(18)
  },
  stylish: {
    height: 48,
    borderColor: '#bdbdbd',
    borderWidth: 2,
    borderRadius: 32
  }
};
export default class ComposePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      allowPointerEvents: true,
      showContent: false,
      selected: '',
      startDate: null,
      endDate: null,
      date: new Date(),
      focus: 'startDate',
      currentDate: moment()
    };
  }
  isDateBlocked = date => {
    if (this.props.blockBefore) {
      return date.isBefore(moment(), 'day');
    } else if (this.props.blockAfter) {
      return date.isAfter(moment(), 'day');
    }
    return false;
  };
  onDatesChange = event => {
    const { startDate, endDate, focusedInput, currentDate } = event;
    const resultDay =  endDate - startDate
    const duration = moment.duration(resultDay, 'milliseconds');
    const days = duration.asDays();
    if (currentDate) {
      this.setState({ currentDate });
      return;
    }
    this.setState({ ...this.state, focus: focusedInput }, () => {
      if(days > 6){
        this.setState({ startDate: null, endDate:null });
      }else{
        this.setState({ ...this.state, startDate, endDate });
      }
     
    });
  };
  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };
  onConfirm = () => {
    const returnFormat = this.props.returnFormat || 'YYYY-MM-DD';
    const outFormat = this.props.outFormat || 'LL';
    if (!this.props.mode || this.props.mode === 'single') {
      this.setState({
        showContent: true,
        selected: this.state.currentDate.format(outFormat)
      });
      this.setModalVisible(false);
      if (typeof this.props.onConfirm === 'function') {
        this.props.onConfirm({
          currentDate: this.state.currentDate.format(returnFormat)
        });
      }
      return;
    }

    if (this.state.startDate && this.state.endDate) {
      const start = this.state.startDate.format('YYYY-MM-DD');
      const end = this.state.endDate.format('YYYY-MM-DD');
      const duration = moment.duration(this.state.endDate?.diff(this.state.startDate));
      const days = duration.asDays();
      if(days > 6){
        ToastAndroid.showWithGravity(
          "Max 7 days!",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      }else{
      this.setState({
        showContent: true,
        selected: `${start} - ${end}`
      });
      this.setModalVisible(false);
      if (typeof this.props.onConfirm === 'function') {
        this.props.onConfirm({
          startDate: this.state.startDate.format(returnFormat),
          endDate: this.state.endDate.format(returnFormat)
        });
      }
    }
    } else {
      alert('please select correct date');
    }
  };
  getTitleElement() {
    const { placeholder, customStyles = {}, allowFontScaling } = this.props;
    const showContent = this.state.showContent;
    if (!showContent && placeholder) {
      return (
        <Text
          allowFontScaling={allowFontScaling}
          style={[styles.placeholderText, customStyles.placeholderText]}
        >
          {placeholder}
        </Text>
      );
    }
    return (
      <Text
        allowFontScaling={allowFontScaling}
        style={[styles.contentText, customStyles.contentText]}
      >
        {this.state.selected}
      </Text>
    );
  }

  renderButton = () => {
    const { customButton } = this.props;

    if (customButton) {
      return customButton(this.onConfirm);
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10}}>
       <TouchableHighlight
        underlayColor={'transparent'}
        onPress={() =>  this.setModalVisible(false)}
        style={[
          { width: '30%',borderWidth: 1, borderColor:  "#8DC53F", justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8},
          this.props.ButtonStyle
        ]}
      >
        <Text style={[{ fontSize: 20 }, this.props.ButtonTextStyle]}>
         Cancel
        </Text>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={this.onConfirm}
        style={[
          { width: '30%',borderWidth: 1, backgroundColor:  "#8DC53F", borderColor: "#fff", justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 8},
          this.props.ButtonStyle
        ]}
      >
        <Text style={{ fontSize: 14, color: '#fff',  fontFamily: 'OpenSans', }}>
         Apply
        </Text>
      </TouchableHighlight>
      </View>
    
    );
  };

  render() {
    const { customStyles = {} } = this.props;

    let style = styles.stylish;
    style = this.props.centerAlign ? { ...style } : style;
    style = { ...style, ...this.props.style };

    return (
      <TouchableHighlight
        underlayColor={'transparent'}
        onPress={() => {
          this.setModalVisible(true);
        }}
        style={[
          { width: '100%', height: '100%', justifyContent: 'center' },
          style
        ]}
      >
        <View>
          <View>
            <View style={[customStyles.contentInput, styles.contentInput]}>
              {this.getTitleElement()}
            </View>
          </View>
          <Modal
            animationType="slide"
            onRequestClose={() => this.setModalVisible(false)}
            transparent={false}
            visible={this.state.modalVisible}
          >
            <View stlye={{ flex: 1, flexDirection: 'column' }}>
              <View style={{ height: '90%' }}>
                <DateRange
                  headFormat={this.props.headFormat}
                  customStyles={customStyles}
                  markText={this.props.markText}
                  onDatesChange={this.onDatesChange}
                  isDateBlocked={this.isDateBlocked}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  focusedInput={this.state.focus}
                  selectedBgColor={this.props.selectedBgColor || undefined}
                  selectedTextColor={this.props.selectedTextColor || undefined}
                  mode={this.props.mode || 'single'}
                  currentDate={this.state.currentDate}
                />
              </View>
              {this.renderButton()}
            </View>
          </Modal>
        </View>
      </TouchableHighlight>
    );
  }
}

ComposePicker.propTypes = {
  dateSplitter: PropTypes.string
};

ComposePicker.defaultProps = { dateSplitter: '-' };
