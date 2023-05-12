cd ..
yarn install
yarn dist
cp 'dist/Android Messages-v5.4.1-linux-x86_64.AppImage' ~/.local/bin/
cp resources/icons/512x512.png ~/.local/share/icons/messages.png

cat > ~/.local/share/applications/messages.desktop <<EOF
[Desktop Entry]
Name=Messages
StartupWMClass=android-messages-desktop
Comment=Messages by Google - A simple, helpful text messaging app
GenericName=Android Messages
Exec=/home/$USER/.local/bin/Android\ Messages-v5.4.1-linux-x86_64.AppImage
Icon=messages
Type=Application
Categories=Network;InstantMessaging;
EOF

