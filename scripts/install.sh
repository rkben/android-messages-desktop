cd ..
yarn install
yarn dist

version=$(grep -Po '(?<="version": ")[0-9.]+' package.json)

cp "dist/Android Messages-v$version-linux-x86_64.AppImage" ~/.local/bin/
cp resources/icons/512x512.png ~/.local/share/icons/messages.png

cat > ~/.local/share/applications/messages.desktop <<EOF
[Desktop Entry]
Name=Messages
StartupWMClass=android-messages-desktop
Comment=Messages by Google - A simple, helpful text messaging app
GenericName=Android Messages
Exec=/home/$USER/.local/bin/Android\ Messages-v$version-linux-x86_64.AppImage
Icon=messages
Type=Application
Categories=Network;InstantMessaging;
EOF

