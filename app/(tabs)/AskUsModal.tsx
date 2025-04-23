import React, { useState } from 'react';
import { Modal as RNModel,ModalProps, KeyboardAvoidingView, View, TextInput, Button, Text, StyleSheet, Alert, Platform } from 'react-native';

type PROPS = ModalProps & {
  isOpen: boolean
  withInput?: boolean
}

export const AskUsModal = ({ isOpen, withInput , children, ...rest}: PROPS ) =>{
  const content = withInput ? (
    <KeyboardAvoidingView
    className='items-center justify-center flex-1 px-3 bg-zinc-900/40'
    behavior={Platform.OS ==='ios' ? 'padding': 'height'}
    >
      { children }</KeyboardAvoidingView>
  ): (
    <View  className='items-center justify-center flex-1 px-3 bg-zinc-900/40'>{ children }</View>
  )

  return(
    <RNModel
    visible={isOpen}
    transparent
    animationType='fade'
    statusBarTranslucent
    {...rest}>

      {content}

    </RNModel>
  )
}