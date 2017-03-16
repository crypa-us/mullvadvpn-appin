import path from 'path';
import { EventEmitter } from 'events';
import { systemPreferences } from 'electron';
import TrayAnimation from './tray-animation';
import Enum from './enum';

const menubarIcons = {
  base: path.join(path.resolve(__dirname, '..'), 'assets/images/menubar icons'),
  spinner: {
    light: 'light ui/spinner/spinner-{s}-light.png',
    dark: 'dark ui/spinner/spinner-{s}-dark.png'
  },
  lock: {
    light: 'light ui/lock/lock-{s}-light.png',
    dark: 'dark ui/lock/lock-{s}-dark.png'
  }
};

/**
 * Tray icon provider
 * 
 * @export
 * @class TrayIconProvider
 */
export default class TrayIconProvider extends EventEmitter {
  
  /**
   * EventType
   * @type {TrayIconProvider.EventType}
   * @property {string} themeChanged - event fired when menubar theme is changed
   */
  static EventType = new Enum('themeChanged');

  /**
   * Creates an instance of TrayIconProvider.
   * 
   * @memberOf TrayIconProvider
   */
  constructor() {
    super();

    this._themeChangeObserver = systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
      this.emit(TrayIconProvider.EventType.themeChanged);
    });
  }

  /**
   * Destroys TrayIconProvider
   * 
   * @memberOf TrayIconProvider
   */
  destroy() {
    if(this._themeChangeObserver) {
      systemPreferences.unsubscribeNotification(this._themeChangeObserver);
      this._themeChangeObserver = null;
    }
  }

  /**
   * Get lock animation
   * 
   * @param {boolean} [isReverse=false] whether animation should be reversed
   * @returns TrayIconAnimator
   * 
   * @memberOf TrayIconProvider
   */
  lockAnimation(isReverse = false) {
    let animation = TrayAnimation.fromFileSequence(this._lockPath, [1, 9]);
    animation.speed = 100;
    animation.reverse = isReverse;

    return animation;
  }

  /**
   * Get unlock animation
   * 
   * @returns TrayIconAnimator
   * 
   * @memberOf TrayIconProvider
   */
  unlockAnimation() {
    return this.lockAnimation(true);
  }

  /**
   * Get spinner animation
   * 
   * @returns TrayIconAnimator
   * 
   * @memberOf TrayIconProvider
   */
  spinnerAnimation() {
    let animation = TrayAnimation.fromFileSequence(this._spinnerPath, [1, 9]);
    animation.speed = 100;
    animation.repeat = true;

    return animation;
  }

  /**
   * Pattern to spinner animation assets based on macOS menubar theme
   * 
   * @readonly
   * 
   * @memberOf TrayIconProvider
   */
  get _spinnerPath() {
    return path.join(menubarIcons.base, menubarIcons.spinner[this._colorTheme]);
  }
  
  /**
   * Pattern to lock/unlock animation assets based on macOS menubar theme
   * 
   * @readonly
   * 
   * @memberOf TrayIconProvider
   */
  get _lockPath() {
    return path.join(menubarIcons.base, menubarIcons.lock[this._colorTheme]);
  }

  /**
   * Current theme name based on macOS menubar theme.
   * 
   * @readonly
   * 
   * @memberOf TrayIconProvider
   */
  get _colorTheme() {
    return systemPreferences.isDarkMode() ? 'dark' : 'light';
  }

}