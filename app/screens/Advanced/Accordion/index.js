/**
 * @format
 */
import React, { Component } from 'react'
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Entypo'

import * as CSS from '../../../res/css'

/**
 * @typedef {{ action?: () => void, icon: string, name: string }} Option
 */

/**
 * @template T
 * @typedef {{ content: T[], totalPages: number, page: number }|T[]} Data
 */

/**
 * @template T
 * @typedef {object} Props
 * @prop {boolean} open
 * @prop {Option[]} menuOptions
 * @prop {string} title
 * @prop {() => void} toggleAccordion
 * @prop {React.ComponentType<{ data: T }>} Item
 * @prop {(item: T) => string} keyExtractor
 * @prop {((key: string) => void)=} onPressItem
 * @prop {(() => void)=} fetchNextPage Pass only when paginated
 * @prop {Data<T>} data Pass an array when not paginated.
 * @prop {boolean=} hideBottomBorder
 */

/**
 * @template T
 * @augments React.Component<Props<T>>
 */
export default class Accordion extends Component {
  static defaultProps = {
    menuOptions: [],
  }

  state = {
    menuOpen: false,
    menuOpenAnimation: new Animated.Value(0),
  }

  toggleMenuOpen = () => {
    const { menuOpen, menuOpenAnimation } = this.state
    Animated.timing(menuOpenAnimation, {
      toValue: menuOpen ? 0 : 1,
      easing: Easing.inOut(Easing.ease),
      duration: 200,
    }).start()
    this.setState({
      menuOpen: !menuOpen,
    })
  }

  /**
   * @type {import('react-native').ListRenderItem<T>}
   */
  itemRender = ({ item }) => {
    const { Item, keyExtractor, onPressItem } = this.props

    return ((
      <TouchableOpacity
        // eslint-disable-next-line react/jsx-no-bind
        onPress={() => {
          onPressItem && onPressItem(keyExtractor(item))
        }}
      >
        <Item data={item} />
      </TouchableOpacity>
    ))
  }

  /**
   * @param {Option[]} options
   */
  renderTRXMenu = options => {
    const { open } = this.props
    const { menuOpenAnimation } = this.state
    if (open && options && options.length > 0) {
      return (
        <View style={styles.accordionMenu}>
          {options.map((option, i) => (
            <TouchableWithoutFeedback
              key={option ? option.name + i : i}
              onPress={option.action}
            >
              <Animated.View
                style={[
                  styles.accordionMenuItem,
                  {
                    opacity: menuOpenAnimation,
                    marginRight: menuOpenAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                ]}
              >
                <View style={styles.accordionMenuItemIcon}>
                  <Icon name={option.icon} size={20} color="#294f93" />
                </View>
                <Text style={styles.accordionMenuItemText}>{option.name}</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          ))}
          <TouchableWithoutFeedback onPress={this.toggleMenuOpen}>
            <Animated.View
              style={[
                styles.accordionMenuBtn,
                {
                  transform: [
                    {
                      rotateZ: menuOpenAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg'],
                      }),
                    },
                    {
                      perspective: 1000,
                    },
                  ],
                },
              ]}
            >
              <Icon name="plus" size={30} color="white" />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      )
    }

    return null
  }

  onEndReached = () => {
    const { data, fetchNextPage } = this.props

    if (Array.isArray(data)) {
      throw new TypeError()
    }

    if (data.page < data.totalPages && fetchNextPage) {
      fetchNextPage()
    }
  }

  render() {
    const {
      title,
      open,
      toggleAccordion,
      data,
      Item,
      menuOptions,
      keyExtractor,
      onPressItem,
      hideBottomBorder,
    } = this.props
    return (
      <View
        style={open ? xStyles.accordionItemOpen : xStyles.accordionItemClosed}
      >
        <TouchableOpacity
          onPress={toggleAccordion}
          style={styles.accordionItem}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={open ? ['#00A5BD', '#00A5BD'] : ['#005E78', '#006593']}
            style={[
              styles.accordionHeader,
              !open && !hideBottomBorder && styles.accordionHeaderBottomBorder,
              styles.accordionHeaderTopBorder,
            ]}
          >
            <Text style={styles.accordionHeaderText}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!Array.isArray(data) ? (
          <FlatList
            data={data.content}
            renderItem={this.itemRender}
            style={open ? CSS.styles.height100 : CSS.styles.height0}
            keyExtractor={keyExtractor}
            onEndReached={this.onEndReached}
          />
        ) : (
          <ScrollView style={open ? CSS.styles.height100 : CSS.styles.height0}>
            {data.map((item, i) => (
              <TouchableOpacity
                // eslint-disable-next-line react/no-array-index-key
                key={String(item) + i}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={() => {
                  onPressItem && onPressItem(keyExtractor(item))
                }}
              >
                <Item data={item} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {this.renderTRXMenu(menuOptions)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  accordionItem: {
    width: '100%',
  },
  accordionHeaderTopBorder: {
    borderTopWidth: 1,
  },
  accordionHeaderBottomBorder: {
    borderBottomWidth: 1,
  },
  accordionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: CSS.Colors.BORDER_WHITE,
    borderStyle: 'solid',
    elevation: 2,
  },
  accordionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CSS.Colors.TEXT_WHITE,
  },
  accordionMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  accordionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 20,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    marginRight: 15,
    elevation: 3,
  },
  accordionMenuItemIcon: {
    marginRight: 10,
  },
  accordionMenuItemText: {
    color: CSS.Colors.BLUE_DARK,
    fontWeight: 'bold',
  },
  accordionMenuBtn: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: CSS.Colors.GRS_DARK_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
})

const xStyles = {
  accordionItemOpen: [styles.accordionItem, CSS.styles.flex],
  accordionItemClosed: [styles.accordionItem, CSS.styles.flexZero],
}
